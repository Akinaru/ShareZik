"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * Route pour récupérer les utilisateurs non validés
 * @route GET /users/unvalidated
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @returns {Array} - Un tableau d'objets contenant les informations des utilisateurs non validés
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {500} - Si une erreur serveur se produit
 */
router.get('/users/unvalidated', auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Non authentifié' });
            return;
        }
        if (req.user.rank !== 'admin') {
            res.status(403).json({ error: 'Accès refusé', rank: req.user.rank });
            return;
        }
        const result = await db_1.pool.query(`
      SELECT id, email, name, rank, created_at
      FROM users
      WHERE is_validated = false
    `);
        res.json(result.rows);
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur récupération utilisateurs non validés' });
        return;
    }
});
/**
 * Route pour récupérer les informations de l'utilisateur connecté
 * @route GET /me
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @returns {object} - Les informations de l'utilisateur (id, email, name, rank, created_at, is_validated)
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {404} - Si l'utilisateur n'est pas trouvé
 * @throws {500} - Si une erreur serveur se produit
 */
router.get('/me', auth_1.verifyToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Utilisateur non authentifié' });
            return;
        }
        const userId = req.user.id;
        const result = await db_1.pool.query('SELECT id, email, name, rank, created_at, is_validated FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Utilisateur introuvable' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
/**
 * Route pour l'enregistrement d'un nouvel utilisateur
 * @route POST /register
 * @param {string} email - L'email de l'utilisateur
 * @param {string} name - Le nom de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {object} - Un objet contenant le token JWT et les informations de l'utilisateur
 * @throws {400} - Si l'email ou le mot de passe est manquant
 * @throws {409} - Si l'email est déjà utilisé
 */
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe obligatoires' });
        return;
    }
    try {
        // Vérifie si l’email existe déjà
        const existing = await db_1.pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
        if (existing.rows.length > 0) {
            res.status(409).json({ error: 'Cette adresse email est déjà utilisée.' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.pool.query(`INSERT INTO users (email, name, password, rank) VALUES ($1, $2, $3, 'guest') RETURNING id, email, name, rank, created_at`, [email, name, hashedPassword]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
});
/**
 * Route pour la connexion d'un utilisateur
 * @route POST /login
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {object} - Un objet contenant le token JWT et les informations de l'utilisateur
 * @throws {400} - Si l'email ou le mot de passe est manquant
 * @throws {401} - Si l'utilisateur n'est pas trouvé ou si le mot de passe est incorrect
 * @throws {500} - Si une erreur serveur se produit
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe requis' });
        return;
    }
    try {
        const result = await db_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Utilisateur non trouvé' });
            return;
        }
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ error: 'Mot de passe incorrect' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});
/**
 * Route pour récupérer les utilisateurs invités
 * @route GET /users/guests
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @returns {Array} - Un tableau d'objets contenant les informations des utilisateurs invités
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {500} - Si une erreur serveur se produit
 */
router.get("/users/guests", auth_1.verifyToken, auth_1.requireAdmin, async (_req, res) => {
    try {
        const result = await db_1.pool.query(`SELECT id, email, name, rank, created_at, is_validated FROM users WHERE rank = 'guest'`);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération utilisateurs" });
    }
});
/**
 *  Route pour valider ou invalider un utilisateur
 * @route PUT /users/:id/validate
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @param {number} id - L'ID de l'utilisateur à valider/invalider
 * @returns {object} - Un objet contenant le message de succès et les informations de l'utilisateur mis à jour
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {404} - Si l'utilisateur n'est pas trouvé
 * @throws {500} - Si une erreur serveur se produit
 */
router.put("/users/:id/validate", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const result = await db_1.pool.query(`UPDATE users SET is_validated = NOT is_validated WHERE id = $1 RETURNING id, email, name, rank, is_validated`, [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json({ message: "Statut mis à jour", user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
});
/**
 * Route pour valider un utilisateur spécifique
 * @route PUT /validate/:id
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @param {number} id - L'ID de l'utilisateur à valider
 * @returns {object} - Un objet contenant le message de succès et les informations de l'utilisateur validé
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {404} - Si l'utilisateur n'est pas trouvé
 * @throws {500} - Si une erreur serveur se produit
 */
router.put('/validate/:id', auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    const userIdToValidate = parseInt(req.params.id);
    const isAdmin = req.user?.rank === "admin";
    if (!isAdmin) {
        res.status(403).json({ error: 'Accès refusé' });
        return;
    }
    try {
        const result = await db_1.pool.query(`UPDATE users SET is_validated = true WHERE id = $1 RETURNING id, email, name, is_validated`, [userIdToValidate]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Utilisateur introuvable' });
            return;
        }
        res.json({ message: "Utilisateur validé", user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la validation" });
    }
});
/**
 * Route pour récupérer tous les utilisateurs
 * @route GET /users
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @returns {Array} - Un tableau d'objets contenant les informations de tous les utilisateurs
 * @throws {401} - Si l'utilisateur n'est pas authentifié
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {500} - Si une erreur serveur se produit
 */
router.get("/users", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const result = await db_1.pool.query(`
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération utilisateurs" });
    }
});
/**
 * Route pour mettre à jour le rang d'un utilisateur
 * @route PUT /users/:id/rank
 * @param {string} Authorization - Le token JWT de l'utilisateur
 * @param {number} id - L'ID de l'utilisateur dont le rang doit être mis à jour
 * @param {object} body - Le corps de la requête contenant le nouveau rang
 * @param {string} body.rank - Le nouveau rang de l'utilisateur (guest, mod, admin)
 * @returns {object} - Un objet contenant le message de succès et les informations de l'utilisateur mis à jour
 * @throws {403} - Si l'utilisateur n'est pas administrateur
 * @throws {400} - Si le rang fourni est invalide
 * @throws {404} - Si l'utilisateur n'est pas trouvé
 * @throws {500} - Si une erreur serveur se produit
 */
router.put("/users/:id/rank", auth_1.verifyToken, auth_1.requireAdmin, async (req, res) => {
    const userIdToUpdate = parseInt(req.params.id);
    const newRank = req.body.rank;
    if (req.user?.rank !== "admin") {
        res.status(403).json({ error: "Accès refusé" });
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
        const result = await db_1.pool.query(query, [newRank, userIdToUpdate]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json({ message: "Rang mis à jour", user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
exports.default = router;
