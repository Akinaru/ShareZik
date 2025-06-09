import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { pool } from "../db"

export interface AuthRequest extends Request {
  user?: { id: number }
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(" ")[1]

  if (!token) {
    res.status(401).json({ error: "Token manquant" })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    req.user = { id: decoded.id }
    next()
  } catch (err) {
    res.status(401).json({ error: "Token invalide" })
    return
  }
}

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id

  if (!userId) {
    res.status(401).json({ error: "Utilisateur non authentifié" })
    return
  }

  try {
    const result = await pool.query(`SELECT rank FROM users WHERE id = $1`, [userId])
    const user = result.rows[0]

    if (!user || user.rank !== "admin") {
      res.status(403).json({ error: "Accès réservé aux administrateurs" })
      return
    }

    next()
  } catch (err) {
    console.error("Erreur vérification admin :", err)
    res.status(500).json({ error: "Erreur interne" })
  }
}
