import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../lib/db";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";

export const authRouter = express.Router();

type LoginBody = { email?: string; password?: string };
type DbUser = {
    id: number;
    email: string;
    password?: string | null;
    name?: string | null;
};

type JwtPayload = {
    sub: number;
    email: string;
    iat?: number;
    exp?: number;
};
function isJwtPayload(value: unknown): value is JwtPayload {
    if (!value || typeof value !== "object") return false;

    const v = value as Record<string, unknown>;

    return typeof v.sub === "number" && typeof v.email === "string";
}

authRouter.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
        return res.status(400).json({ message: "email と password は必須です" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ message: "JWT_SECRET が未設定です" });
    }

    // ★ここがDB版の核（emailで検索）
    const r = await pool.query<DbUser>(
        `SELECT id, email, password FROM users WHERE email = $1`,
        [email.trim()]
    );

    if (r.rowCount === 0) {
        return res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
    }

    const user = r.rows[0]!;

    if (!user.password || user.password !== password) {
        return res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
    }
    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
    });

    const refreshToken = signRefreshToken({
        sub: user.id,
    });

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
   VALUES ($1,$2, NOW() + interval '7 days')`,
        [user.id, refreshToken]
    );

    return res.json({
        token: accessToken,
        refreshToken,
    });

});

authRouter.get("/me", async (req: Request, res: Response) => {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({ message: "JWT_SECRET が未設定です" });
    }

    const auth = req.headers.authorization ?? "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ message: "認証が必要です" });
    }

    try {

        const decoded = jwt.verify(token, secret);

        if (!isJwtPayload(decoded)) {
            return res.status(401).json({ message: "token が不正です" });
        }

        const userId = decoded.sub;

        const r = await pool.query<DbUser>(
            `SELECT id, email, name FROM users WHERE id = $1`,
            [userId]
        );

        if (r.rowCount === 0) {
            return res.status(401).json({ message: "ユーザーが存在しません" });
        }

        const user = r.rows[0]!;

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name ?? "",
            },
        });

    } catch {
        return res.status(401).json({ message: "token が無効です" });
    }


});
authRouter.post("/refresh", async (req, res) => {

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "refresh token required" });
    }

    try {

        const decoded = verifyToken(refreshToken) as any;

        const r = await pool.query(
            `SELECT * FROM refresh_tokens
       WHERE token=$1 AND revoked_at IS NULL`,
            [refreshToken]
        );

        if (r.rowCount === 0) {
            return res.status(401).json({ message: "invalid refresh token" });
        }

        const userId = decoded.sub;

        const user = await pool.query(
            `SELECT id,email FROM users WHERE id=$1`,
            [userId]
        );

        if (user.rowCount === 0) {
            return res.status(401).json({ message: "user not found" });
        }

        const accessToken = signAccessToken({
            sub: user.rows[0].id,
            email: user.rows[0].email,
        });

        return res.json({
            token: accessToken,
        });

    } catch {

        return res.status(401).json({
            message: "refresh token invalid",
        });

    }

});

authRouter.post("/logout", async (req, res) => {

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.json({ ok: true });
    }

    await pool.query(
        `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token = $1`,
        [refreshToken]
    );

    return res.json({ ok: true });

});

export default authRouter;