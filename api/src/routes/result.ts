import { Router } from "express";
import { db } from "../lib/db";

const router = Router();

router.get("/stats", async (_req, res) => {
    try {
        const users = await db.user.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
                results: {
                    select: {
                        win: true,
                        lose: true,
                    },
                },
            },
        });

        const items = users
            .map((user) => ({
                id: user.id,
                name: user.name,
                win_count: user.results.reduce((sum, result) => sum + result.win, 0),
                lose_count: user.results.reduce((sum, result) => sum + result.lose, 0),
            }))
            .sort((a, b) => {
                if (b.win_count !== a.win_count) return b.win_count - a.win_count;
                if (a.lose_count !== b.lose_count) return a.lose_count - b.lose_count;
                return a.id - b.id;
            });

        res.json({ items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "戦績取得に失敗しました" });
    }
});

router.post("/battle/result", async (req, res) => {
    try {
        const { winner_id, loser_id } = req.body;

        if (typeof winner_id !== "number" || typeof loser_id !== "number") {
            return res.status(400).json({
                message: "winner_id と loser_id は数値で送ってください",
            });
        }

        if (winner_id === loser_id) {
            return res.status(400).json({
                message: "winner_id と loser_id には別のユーザーを指定してください",
            });
        }

        const users = await db.user.findMany({
            where: {
                id: {
                    in: [winner_id, loser_id],
                },
            },
            select: { id: true },
        });

        if (users.length !== 2) {
            return res.status(404).json({
                message: "指定したユーザーが存在しません",
            });
        }

        await db.$transaction([
            db.result.create({
                data: {
                    userId: winner_id,
                    win: 1,
                    lose: 0,
                },
            }),
            db.result.create({
                data: {
                    userId: loser_id,
                    win: 0,
                    lose: 1,
                },
            }),
        ]);

        res.status(201).json({
            message: "対戦結果を登録しました",
            winner_id,
            loser_id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "対戦結果の登録に失敗しました" });
    }
});

export default router;
