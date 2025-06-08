import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './db'

import authRoutes from './routes/auth'
import trackRoutes from './routes/tracks'
import commentRoutes from './routes/comments'
import likeRoutes from './routes/likes'
import categoryRoutes from './routes/categories'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', authRoutes)
app.use('/api/tracks', trackRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.send('🎵 API TypeScript + Postgres is running')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🚀 Server ready on http://localhost:${PORT}`)
})
