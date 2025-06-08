import { Router } from 'express'
import { pool } from '../db'

const router = Router()

router.post('/likes', async (req, res) => {
  const { userId, trackId } = req.body
  try {
    await pool.query(
      `INSERT INTO likes (user_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, trackId]
    )
    res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur ajout like' })
  }
})

router.delete('/likes', async (req, res) => {
  const { userId, trackId } = req.body
  try {
    await pool.query(`DELETE FROM likes WHERE user_id = $1 AND track_id = $2`, [userId, trackId])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur suppression like' })
  }
})

router.get('/likes/:trackId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE track_id = $1`,
      [req.params.trackId]
    )
    res.json({ likes: Number(result.rows[0].count) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération likes' })
  }
})

export default router
