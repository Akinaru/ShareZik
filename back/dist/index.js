// src/index.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";

// src/routes/auth.ts
import { Router } from "express";

// src/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT)
});

// src/routes/auth.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";

// src/middlewares/auth.ts
import jwt from "jsonwebtoken";
var verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token manquant" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(`SELECT rank FROM users WHERE id = $1`, [decoded.id]);
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    req.user = { id: decoded.id, rank: user.rank };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token invalide" });
  }
};
var requireAdmin = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Utilisateur non authentifi\xE9" });
    return;
  }
  try {
    const result = await pool.query(`SELECT rank FROM users WHERE id = $1`, [userId]);
    const user = result.rows[0];
    if (!user || user.rank !== "admin") {
      res.status(403).json({ error: "Acc\xE8s r\xE9serv\xE9 aux administrateurs" });
      return;
    }
    next();
  } catch (err) {
    console.error("Erreur v\xE9rification admin :", err);
    res.status(500).json({ error: "Erreur interne" });
  }
};

// src/routes/auth.ts
var router = Router();
router.get("/users/unvalidated", verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Non authentifi\xE9" });
      return;
    }
    if (req.user.rank !== "admin") {
      res.status(403).json({ error: "Acc\xE8s refus\xE9", rank: req.user.rank });
      return;
    }
    const result = await pool.query(`
      SELECT id, email, name, rank, created_at
      FROM users
      WHERE is_validated = false
    `);
    res.json(result.rows);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration utilisateurs non valid\xE9s" });
    return;
  }
});
router.get("/me", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifi\xE9" });
      return;
    }
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, email, name, rank, created_at, is_validated FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe obligatoires" });
    return;
  }
  try {
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "Cette adresse email est d\xE9j\xE0 utilis\xE9e." });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, name, password, rank) VALUES ($1, $2, $3, 'guest') RETURNING id, email, name, rank, created_at`,
      [email, name, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt2.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rank: user.rank,
        created_at: user.created_at,
        is_validated: false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la cr\xE9ation" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ error: "Utilisateur non trouv\xE9" });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: "Mot de passe incorrect" });
      return;
    }
    const token = jwt2.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rank: user.rank,
        created_at: user.created_at,
        is_validated: user.is_validated
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});
router.get("/users/guests", verifyToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, rank, created_at, is_validated FROM users WHERE rank = 'guest'`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration utilisateurs" });
  }
});
router.put("/users/:id/validate", verifyToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE users SET is_validated = NOT is_validated WHERE id = $1 RETURNING id, email, name, rank, is_validated`,
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    res.json({ message: "Statut mis \xE0 jour", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise \xE0 jour" });
  }
});
router.put("/validate/:id", verifyToken, requireAdmin, async (req, res) => {
  const userIdToValidate = parseInt(req.params.id);
  const isAdmin = req.user?.rank === "admin";
  if (!isAdmin) {
    res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    return;
  }
  try {
    const result = await pool.query(
      `UPDATE users SET is_validated = true WHERE id = $1 RETURNING id, email, name, is_validated`,
      [userIdToValidate]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    res.json({ message: "Utilisateur valid\xE9", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la validation" });
  }
});
router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.rank, 
        u.is_validated, 
        u.created_at,
        COUNT(p.id) AS nb_publi
      FROM users u
      LEFT JOIN publications p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY 
        CASE u.rank 
          WHEN 'admin' THEN 1 
          WHEN 'mod' THEN 2 
          ELSE 3 
        END,
        u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration utilisateurs" });
  }
});
router.put("/users/:id/rank", verifyToken, requireAdmin, async (req, res) => {
  const userIdToUpdate = parseInt(req.params.id);
  const newRank = req.body.rank;
  if (req.user?.rank !== "admin") {
    res.status(403).json({ error: "Acc\xE8s refus\xE9" });
    return;
  }
  const allowedRanks = ["guest", "mod", "admin"];
  if (!allowedRanks.includes(newRank)) {
    res.status(400).json({ error: "Rang invalide" });
    return;
  }
  try {
    const query = `
      UPDATE users 
      SET 
        rank = $1::text,
        is_validated = CASE WHEN $1::text IN ('mod', 'admin') THEN true ELSE is_validated END
      WHERE id = $2
      RETURNING id, name, rank, is_validated
    `;
    const result = await pool.query(query, [newRank, userIdToUpdate]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    res.json({ message: "Rang mis \xE0 jour", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
var auth_default = router;

// src/routes/publication.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.post("/", verifyToken, async (req, res) => {
  const {
    url,
    platform,
    title,
    artist,
    coverUrl,
    embedUrl,
    tags,
    genreIds
  } = req.body;
  const userId = req.user.id;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const insertPublication = await client.query(
      `INSERT INTO publications (user_id, url, platform, title, artist, cover_url, embed_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, url, platform, title, artist, coverUrl, embedUrl, tags]
    );
    const publicationId = insertPublication.rows[0].id;
    for (const genreId of genreIds) {
      await client.query(
        `INSERT INTO publication_genres (publication_id, genre_id) VALUES ($1, $2)`,
        [publicationId, genreId]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ success: true, publicationId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erreur ajout publication avec cat\xE9gories" });
  } finally {
    client.release();
  }
});
router2.get("/", async (_req, res) => {
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
    `);
    const publications = result.rows.map((row) => ({
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
        rank: row.user_rank
      },
      genres: row.genres.filter((c) => c.id !== null)
    }));
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration publications" });
  }
});
router2.get("/getbygenreid/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      JOIN publication_genres pg ON pg.publication_id = t.id
      JOIN genres c2 ON c2.id = pg.genre_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      WHERE pg.genre_id = $1
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `, [id]);
    const publications = result.rows.map((row) => ({
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
        rank: row.user_rank
      },
      genres: row.genres.filter((c) => c.id !== null)
    }));
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration publications par genre" });
  }
});
router2.get("/last", async (_req, res) => {
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
    `);
    const publications = result.rows.map((row) => ({
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
        rank: row.user_rank
      },
      genres: row.genres.filter((c) => c.id !== null)
    }));
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration derni\xE8res publications" });
  }
});
router2.get("/my", verifyToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Utilisateur non authentifi\xE9" });
    return;
  }
  try {
    const result = await pool.query(
      `
      SELECT 
        t.*,
        u.name AS user_name,
        u.rank AS user_rank,
        json_agg(json_build_object('id', c.id, 'name', c.name)) AS genres
      FROM publications t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN publication_genres tc ON tc.publication_id = t.id
      LEFT JOIN genres c ON c.id = tc.genre_id
      WHERE t.user_id = $1
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
      `,
      [userId]
    );
    const publications = result.rows.map((row) => ({
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
        rank: row.user_rank
      },
      genres: row.genres.filter((c) => c.id !== null)
    }));
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration de vos publications" });
  }
});
router2.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const publicationId = parseInt(req.params.id, 10);
  if (isNaN(publicationId)) {
    res.status(400).json({ error: "ID invalide" });
    return;
  }
  try {
    await pool.query(`DELETE FROM publication_genres WHERE publication_id = $1`, [publicationId]);
    await pool.query(`DELETE FROM publications WHERE id = $1`, [publicationId]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});
router2.put("/:id/genres", async (req, res) => {
  const publicationId = parseInt(req.params.id);
  const { genreIds } = req.body;
  if (!Array.isArray(genreIds)) {
    return res.status(400).json({ error: "genreIds doit \xEAtre un tableau" });
  }
  try {
    await pool.query("DELETE FROM publication_genres WHERE publication_id = $1", [publicationId]);
    const insertQueries = genreIds.map(
      (genreId) => pool.query(
        "INSERT INTO publication_genres (publication_id, genre_id) VALUES ($1, $2)",
        [publicationId, genreId]
      )
    );
    await Promise.all(insertQueries);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise \xE0 jour des genres" });
  }
});
var publication_default = router2;

// src/routes/comments.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post("/comments", async (req, res) => {
  const { userId, trackId, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, track_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [userId, trackId, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur ajout commentaire" });
  }
});
router3.get("/comments/:trackId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT comments.*, users.name, users.avatar
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE track_id = $1
       ORDER BY created_at ASC`,
      [req.params.trackId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration commentaires" });
  }
});
var comments_default = router3;

// src/routes/likes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.post("/likes", async (req, res) => {
  const { userId, trackId } = req.body;
  try {
    await pool.query(
      `INSERT INTO likes (user_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, trackId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur ajout like" });
  }
});
router4.delete("/likes", async (req, res) => {
  const { userId, trackId } = req.body;
  try {
    await pool.query(`DELETE FROM likes WHERE user_id = $1 AND track_id = $2`, [userId, trackId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur suppression like" });
  }
});
router4.get("/likes/:trackId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE track_id = $1`,
      [req.params.trackId]
    );
    res.json({ likes: Number(result.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration likes" });
  }
});
var likes_default = router4;

// src/routes/genres.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id, 
        g.name, 
        COUNT(pg.publication_id) AS nb_publi
      FROM genres g
      LEFT JOIN publication_genres pg ON pg.genre_id = g.id
      GROUP BY g.id
      ORDER BY g.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration cat\xE9gories" });
  }
});
router5.get("/top", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.id, 
        g.name, 
        COALESCE(COUNT(pg.publication_id), 0) AS nb_publi
      FROM genres g
      LEFT JOIN publication_genres pg ON pg.genre_id = g.id
      GROUP BY g.id
      ORDER BY nb_publi DESC
      LIMIT 6
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur r\xE9cup\xE9ration genres populaires" });
  }
});
router5.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nom requis" });
  try {
    const result = await pool.query(
      "INSERT INTO genres (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Genre d\xE9j\xE0 existant" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Erreur ajout genre" });
    }
  }
});
router5.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM publication_genres WHERE genre_id = $1",
      [id]
    );
    const result = await pool.query(
      "DELETE FROM genres WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Genre introuvable" });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});
var genres_default = router5;

// src/index.ts
dotenv2.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use("/api", auth_default);
app.use("/api/publications", publication_default);
app.use("/api/comments", comments_default);
app.use("/api/likes", likes_default);
app.use("/api/genres", genres_default);
app.get("/", (_req, res) => {
  res.send("\u{1F3B5} API TypeScript + Postgres is running");
});
var PORT = process.env.PORT || 4e3;
app.listen(PORT, () => {
  console.log(`\u{1F680} Server ready on http://localhost:${PORT}`);
});
