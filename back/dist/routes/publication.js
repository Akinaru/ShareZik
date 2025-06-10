"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.verifyToken, async (req, res) => {
    const { url, platform, title, artist, coverUrl, embedUrl, tags, genreIds } = req.body;
    const userId = req.user.id;
    const client = await db_1.pool.connect();
    try {
        await client.query('BEGIN');
        const insertPublication = await client.query(`INSERT INTO publications (user_id, url, platform, title, artist, cover_url, embed_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`, [userId, url, platform, title, artist, coverUrl, embedUrl, tags]);
        const publicationId = insertPublication.rows[0].id;
        for (const genreId of genreIds) {
            await client.query(`INSERT INTO publication_genres (publication_id, genre_id) VALUES ($1, $2)`, [publicationId, genreId]);
        }
        await client.query('COMMIT');
        res.status(201).json({ success: true, publicationId });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erreur ajout publication avec catégories' });
    }
    finally {
        client.release();
    }
});
router.get('/', async (_req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `);
        const publications = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            url: row.url,
            platform: row.platform,
            title: row.title,
            artist: row.artist,
            coverUrl: row.cover_url,
            embedUrl: row.embed_url,
            tags: row.tags,
            createdAt: row.created_at,
            user: {
                name: row.user_name,
                rank: row.user_rank,
            },
            genres: row.genres.filter((c) => c.id !== null)
        }));
        res.json(publications);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur récupération publications' });
    }
});
router.get('/getbygenreid/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      JOIN publication_genres pg ON pg.publication_id = t.id
      JOIN genres c2 ON c2.id = pg.genre_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      WHERE pg.genre_id = $1
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `, [id]);
        const publications = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            url: row.url,
            platform: row.platform,
            title: row.title,
            artist: row.artist,
            coverUrl: row.cover_url,
            embedUrl: row.embed_url,
            tags: row.tags,
            createdAt: row.created_at,
            user: {
                name: row.user_name,
                rank: row.user_rank,
            },
            genres: row.genres.filter((c) => c.id !== null)
        }));
        res.json(publications);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur récupération publications par genre' });
    }
});
router.get('/last', async (_req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
        const publications = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            url: row.url,
            platform: row.platform,
            title: row.title,
            artist: row.artist,
            coverUrl: row.cover_url,
            embedUrl: row.embed_url,
            tags: row.tags,
            createdAt: row.created_at,
            user: {
                name: row.user_name,
                rank: row.user_rank,
            },
            genres: row.genres.filter((c) => c.id !== null)
        }));
        res.json(publications);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur récupération dernières publications' });
    }
});
router.get("/my", auth_1.verifyToken, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }
    try {
        const result = await db_1.pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      WHERE t.user_id = $1
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
      `, [userId]);
        const publications = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            url: row.url,
            platform: row.platform,
            title: row.title,
            artist: row.artist,
            coverUrl: row.cover_url,
            embedUrl: row.embed_url,
            tags: row.tags,
            createdAt: row.created_at,
            user: {
                name: row.user_name,
                rank: row.user_rank,
            },
            genres: row.genres.filter((c) => c.id !== null),
        }));
        res.json(publications);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération de vos publications" });
    }
});
router.delete("/:id", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    const publicationId = parseInt(req.params.id, 10);
    if (isNaN(publicationId)) {
        res.status(400).json({ error: "ID invalide" });
        return;
    }
    try {
        await db_1.pool.query(`DELETE FROM publication_genres WHERE publication_id = $1`, [publicationId]);
        await db_1.pool.query(`DELETE FROM publications WHERE id = $1`, [publicationId]);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});
// PUT /publications/:id/genres
router.put('/:id/genres', async (req, res) => {
    const publicationId = parseInt(req.params.id);
    const { genreIds } = req.body; // array de IDs
    if (!Array.isArray(genreIds)) {
        return res.status(400).json({ error: 'genreIds doit être un tableau' });
    }
    try {
        // Supprimer les anciens liens
        await db_1.pool.query('DELETE FROM publication_genres WHERE publication_id = $1', [publicationId]);
        // Insérer les nouveaux
        const insertQueries = genreIds.map((genreId) => db_1.pool.query('INSERT INTO publication_genres (publication_id, genre_id) VALUES ($1, $2)', [publicationId, genreId]));
        await Promise.all(insertQueries);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des genres' });
    }
});
exports.default = router;
