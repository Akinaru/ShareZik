"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        g.id, 
        g.name, 
        COUNT(pg.publication_id) AS nb_publi
      FROM genres g
      LEFT JOIN publication_genres pg ON pg.genre_id = g.id
      GROUP BY g.id
      ORDER BY g.name ASC
    `);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur récupération catégories' });
    }
});
router.get('/top', async (_req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        g.id, 
        g.name, 
        COALESCE(COUNT(pg.publication_id), 0) AS nb_publi
      FROM genres g
      LEFT JOIN publication_genres pg ON pg.genre_id = g.id
      GROUP BY g.id
      ORDER BY nb_publi DESC
      LIMIT 6
    `);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération genres populaires" });
    }
});
// POST a new category (admin use)
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Nom requis' });
    try {
        const result = await db_1.pool.query('INSERT INTO genres (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Genre déjà existant' });
        }
        else {
            console.error(err);
            res.status(500).json({ error: 'Erreur ajout genre' });
        }
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Supprimer les relations avec les publications
        await db_1.pool.query('DELETE FROM publication_genres WHERE genre_id = $1', [id]);
        // Supprimer le genre
        const result = await db_1.pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Genre introuvable' });
        }
        res.json({ success: true, deleted: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});
exports.default = router;
