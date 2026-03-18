import express from "express";
import { pool } from "../lib/db";
import { Router } from "express";
;
import cors from "cors";

const router = Router();


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());

app.post("/battle/result", async (req, res) => {
    const { winnerId, loserId } = req.body;

    if (!winnerId || !loserId) {
        return res.status(400).json({
            message: "winnerId と loserId は必須です",
        });
    }

    if (winnerId === loserId) {
        return res.status(400).json({
            message: "同じユーザーは指定できません",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `
      insert into results (win, lose, user_id)
      values ($1, $2, $3)
      `,
            [1, 0, winnerId]
        );

        await client.query(
            `
      insert into results (win, lose, user_id)
      values ($1, $2, $3)
      `,
            [0, 1, loserId]
        );

        await client.query("COMMIT");

        res.json({ message: "対戦結果を保存しました" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "対戦結果の保存に失敗しました" });
    } finally {
        client.release();
    }
});

app.get("/results/stats", async (_req, res) => {
    try {
        const result = await pool.query(`
      select
        u.id,
        u.name,
        coalesce(sum(r.win), 0) as win_count,
        coalesce(sum(r.lose), 0) as lose_count
      from users u
      left join results r on u.id = r.user_id
      group by u.id, u.name
      order by win_count desc, lose_count asc, u.id asc
    `);

        res.json({ items: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "戦績取得に失敗しました" });
    }
});

app.get("/users", async (_req, res) => {
    try {
        const result = await pool.query(`
      select id, name
      from users
      order by id asc
    `);

        res.json({ items: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "ユーザー取得に失敗しました" });
    }
});

export default router;