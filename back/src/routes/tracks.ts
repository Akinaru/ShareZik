import { Router } from 'express'
import { pool } from '../db'
import { AuthRequest, verifyToken } from '../middlewares/auth'

const router = Router()

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const {
    url, platform, title, artist,
    coverUrl, embedUrl, tags, categoryIds
  } = req.body

  const userId = req.user!.id

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const insertTrack = await client.query(
      `INSERT INTO tracks (user_id, url, platform, title, artist, cover_url, embed_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, url, platform, title, artist, coverUrl, embedUrl, tags]
    )
    const trackId = insertTrack.rows[0].id

    for (const categoryId of categoryIds) {
      await client.query(
        `INSERT INTO track_categories (track_id, category_id) VALUES ($1, $2)`,
        [trackId, categoryId]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ success: true, trackId })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Erreur ajout track avec catégories' })
  } finally {
    client.release()
  }
})

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.avatar AS user_avatar,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS categories
      FROM tracks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN track_categories tc ON tc.track_id = t.id
      LEFT JOIN categories c ON c.id = tc.category_id
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `)

    const tracks = result.rows.map(row => ({
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
        avatar: row.user_avatar
      },
      categories: row.categories.filter((c: any) => c.id !== null)
    }))

    res.json(tracks)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération tracks' })
  }
})

export default router
