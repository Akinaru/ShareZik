import { Router, Request, Response } from 'express'
import { pool } from '../db'

const router = Router()

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération catégories' })
  }
})

// POST a new category (admin use)
router.post('/categories', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Nom requis' })

  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if ((err as any).code === '23505') {
      res.status(400).json({ error: 'Catégorie déjà existante' })
    } else {
      console.error(err)
      res.status(500).json({ error: 'Erreur ajout catégorie' })
    }
  }
})

export default router
