import { Router, Request, Response } from 'express'
import { pool } from '../db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthRequest, verifyToken } from '../middlewares/auth'

const router = Router()

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe obligatoires' })
    return
  }

  try {
    // Vérifie si l’email existe déjà
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email])
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Cette adresse email est déjà utilisée.' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (email, name, password, rank) VALUES ($1, $2, $3, 'guest') RETURNING id, email, name, rank, created_at`,
      [email, name, hashedPassword]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })

    res.status(201).json({
      token,
      user
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})


router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' })
    return
  }

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    const user = result.rows[0]

    if (!user) {
      res.status(401).json({ error: 'Utilisateur non trouvé' })
      return
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(401).json({ error: 'Mot de passe incorrect' })
      return
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rank: user.rank,
        created_at: user.created_at,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur lors de la connexion' })
  }
})

router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Utilisateur non authentifié' })
      return
    }
    const userId = req.user.id
    const result = await pool.query(
      'SELECT id, email, name, rank, created_at FROM users WHERE id = $1',
      [userId]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
