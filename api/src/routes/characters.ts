import { pool } from "../lib/db";
import { Router } from "express";


const router = Router();

export type Character = {
    id: number;
    name: string;
    image: string | null;
};

export async function findAllCharacters(): Promise<Character[]> {
    const result = await pool.query<Character>(
        `
    SELECT id, name, image
    FROM characters
    ORDER BY id ASC
    `
    );

    return result.rows;

}
router.get("/characters", async (_req, res) => {
    try {
        const items = await findAllCharacters();

        res.json({ items });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: {
                message: "キャラクター取得に失敗しました",
            },
        });
    }
});

export default router;