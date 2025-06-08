import { Router, Request, Response } from 'express'
import { pool } from '../db'

const router = Router()

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY name ASC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération catégories' })
  }
})


router.get('/top', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id, 
        g.name, 
        COUNT(pg.publication_id) AS publication_count
      FROM genres g
      JOIN publication_genres pg ON pg.genre_id = g.id
      GROUP BY g.id
      ORDER BY publication_count DESC
      LIMIT 5
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erreur récupération genres populaires" })
  }
})



// POST a new category (admin use)
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Nom requis' })

  try {
    const result = await pool.query(
      'INSERT INTO genres (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if ((err as any).code === '23505') {
      res.status(400).json({ error: 'Genre déjà existant' })
    } else {
      console.error(err)
      res.status(500).json({ error: 'Erreur ajout genre' })
    }
  }
})

export default router
