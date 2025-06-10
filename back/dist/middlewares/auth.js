"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token manquant" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const result = await db_1.pool.query(`SELECT rank FROM users WHERE id = $1`, [decoded.id]);
        const user = result.rows[0];
        if (!user) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        req.user = { id: decoded.id, rank: user.rank };
        next();
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ error: "Token invalide" });
    }
};
exports.verifyToken = verifyToken;
const requireAdmin = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }
    try {
        const result = await db_1.pool.query(`SELECT rank FROM users WHERE id = $1`, [userId]);
        const user = result.rows[0];
        if (!user || user.rank !== "admin") {
            res.status(403).json({ error: "Accès réservé aux administrateurs" });
            return;
        }
        next();
    }
    catch (err) {
        console.error("Erreur vérification admin :", err);
        res.status(500).json({ error: "Erreur interne" });
    }
};
exports.requireAdmin = requireAdmin;
