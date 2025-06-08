import { Router } from 'express'
import { pool } from '../db'
import { AuthRequest, verifyToken } from '../middlewares/auth'

const router = Router()

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const {
    url, platform, title, artist,
    coverUrl, embedUrl, tags, genreIds
  } = req.body

  const userId = req.user!.id

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const insertPublication = await client.query(
      `INSERT INTO publications (user_id, url, platform, title, artist, cover_url, embed_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, url, platform, title, artist, coverUrl, embedUrl, tags]
    )
    const publicationId = insertPublication.rows[0].id

    for (const genreId of genreIds) {
      await client.query(
        `INSERT INTO publication_genres (publication_id, genre_id) VALUES ($1, $2)`,
        [publicationId, genreId]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ success: true, publicationId })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Erreur ajout publication avec catégories' })
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
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `)

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
      genres: row.genres.filter((c: any) => c.id !== null)
    }))

    res.json(publications)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération publications' })
  }
})

router.get('/last', async (_req, res) => {
  try {
    const result = await pool.query(`
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
    `)

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
      genres: row.genres.filter((c: any) => c.id !== null)
    }))

    res.json(publications)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur récupération dernières publications' })
  }
})


export default router
