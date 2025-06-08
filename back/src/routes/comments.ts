import { Router } from 'express'
import { pool } from '../db'

const router = Router()

router.post('/comments', async (req, res) => {
  const { userId, trackId, content } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, track_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [userId, trackId, content]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur ajout commentaire' })
  }
})

router.get('/comments/:trackId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT comments.*, users.name, users.avatar
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE track_id = $1
       ORDER BY created_at ASC`,
      [req.params.trackId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération commentaires' })
  }
})

export default router
