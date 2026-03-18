import { Router } from "express";
import { pool } from "../lib/db";

const router = Router();

router.get("/results/stats", async (_req, res) => {
    try {
        const result = await pool.query(`
      select
        u.id,
        u.name,
        coalesce(sum(r.win), 0) as win_count,
        coalesce(sum(r.lose), 0) as lose_count
      from users u
      left join results r
        on u.id = r.user_id
      group by u.id, u.name
      order by win_count desc, lose_count asc, u.id asc
    `);

        res.json({ items: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "戦績取得に失敗しました" });
    }
});

export default router;