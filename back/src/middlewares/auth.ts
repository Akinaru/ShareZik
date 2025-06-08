import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

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
