// server/app.js
import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, initDb } from "./db.js";
import { authGuard } from "./auth.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "Recipe World" }));

app.post("/api/auth/register", asyncHandler(async (req, res) => {
    const { email, username, password } = req.body || {};
    if (!email || !username || !password) return res.status(400).json({ error: "email, username and password are required" });

    const db = await getDb();
    const existing = await db.get("SELECT id FROM users WHERE email = ?", email.trim());
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const r = await db.run(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        email.trim(), username.trim(), hash
    );

    const user = { id: r.lastID, email: email.trim(), username: username.trim() };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const db = await getDb();
    const row = await db.get("SELECT * FROM users WHERE email = ?", email.trim());
    if (!row) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = { id: row.id, email: row.email, username: row.username };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
}));

app.get("/api/auth/me", authGuard, asyncHandler(async (req, res) => {
    res.json({ user: req.user });
}));

app.get("/api/profile", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    const user = await db.get(
        "SELECT id, email, username, created_at FROM users WHERE id = ?",
        req.user.id
    );
    const recipes = await db.all(
        `SELECT id, title, description, ingredients, steps, image_url, created_at, updated_at
     FROM recipes WHERE user_id = ? ORDER BY created_at DESC`,
        req.user.id
    );
    res.json({ user, recipes });
}));

app.get("/api/recipes", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    const recipes = await db.all(
        `SELECT id, title, description, ingredients, steps, image_url, created_at, updated_at
     FROM recipes WHERE user_id = ? ORDER BY created_at DESC`,
        req.user.id
    );
    res.json({ recipes });
}));

app.post("/api/recipes", authGuard, asyncHandler(async (req, res) => {
    const { title, description = "", ingredients = "", steps = "", image_url } = req.body || {};
    if (!title || !title.trim()) return res.status(400).json({ error: "title is required" });

    const db = await getDb();
    const img = image_url && String(image_url).trim() ? String(image_url).trim() : "/food.png";
    const r = await db.run(
        `INSERT INTO recipes (user_id, title, description, ingredients, steps, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
        req.user.id, title.trim(), description, ingredients, steps, img
    );
    const recipe = await db.get(
        `SELECT id, title, description, ingredients, steps, image_url, created_at, updated_at
     FROM recipes WHERE id = ?`,
        r.lastID
    );
    res.status(201).json({ recipe });
}));

app.put("/api/recipes/:id", authGuard, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { title, description, ingredients, steps, image_url } = req.body || {};

    const db = await getDb();
    const current = await db.get(
        "SELECT * FROM recipes WHERE id = ? AND user_id = ?",
        id, req.user.id
    );
    if (!current) return res.status(404).json({ error: "Recipe not found" });

    await db.run(
        `UPDATE recipes
     SET title = ?, description = ?, ingredients = ?, steps = ?,
         image_url = COALESCE(?, image_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        title ?? current.title,
        description ?? current.description,
        ingredients ?? current.ingredients,
        steps ?? current.steps,
        image_url ?? null,
        id
    );
    const recipe = await db.get(
        `SELECT id, title, description, ingredients, steps, image_url, created_at, updated_at
     FROM recipes WHERE id = ?`,
        id
    );
    res.json({ recipe });
}));

app.delete("/api/recipes/:id", authGuard, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const row = await db.get(
        "SELECT id FROM recipes WHERE id = ? AND user_id = ?",
        id, req.user.id
    );
    if (!row) return res.status(404).json({ error: "Recipe not found" });

    await db.run("DELETE FROM recipes WHERE id = ?", id);
    res.json({ ok: true });
}));

app.get("/api/recipes/public", asyncHandler(async (req, res) => {
    const db = await getDb();
    const { q = "", sort = "created_desc", author = "" } = req.query;

    const SORTS = {
        created_desc: "r.created_at DESC",
        created_asc: "r.created_at ASC",
        title_asc: "r.title ASC",
        title_desc: "r.title DESC",
        author_asc: "u.username ASC",
        author_desc: "u.username DESC"
    };
    const orderBy = SORTS[sort] || SORTS.created_desc;

    const where = [];
    const params = [];

    if (q && String(q).trim()) {
        where.push(`(r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ?)`);
        const like = `%${String(q).trim()}%`;
        params.push(like, like, like);
    }
    if (author && String(author).trim()) {
        where.push(`u.username = ?`);
        params.push(String(author).trim());
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await db.all(
        `SELECT r.id, r.title, r.description, r.image_url, r.created_at, r.updated_at, u.username AS author
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     ${whereSql}
     ORDER BY ${orderBy}`,
        params
    );
    res.json({ recipes: rows });
}));

app.get("/api/recipes/public/:id", asyncHandler(async (req, res) => {
    const db = await getDb();
    const r = await db.get(
        `SELECT r.id, r.title, r.description, r.ingredients, r.steps, r.image_url,
            r.created_at, r.updated_at, u.username AS author
     FROM recipes r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
        Number(req.params.id)
    );
    if (!r) return res.status(404).json({ error: "Recipe not found" });
    res.json({ recipe: r });
}));

app.get("/api/recipes/public/:id/comments", asyncHandler(async (req, res) => {
    const db = await getDb();
    const recipe = await db.get(`SELECT id FROM recipes WHERE id = ?`, Number(req.params.id));
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    const comments = await db.all(
        `SELECT c.id, c.content, c.created_at, u.username AS author
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.recipe_id = ?
     ORDER BY c.created_at ASC`,
        Number(req.params.id)
    );
    res.json({ comments });
}));

app.post("/api/recipes/:id/comments", authGuard, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { content } = req.body || {};
    if (!content || !String(content).trim()) return res.status(400).json({ error: "content is required" });

    const db = await getDb();
    const recipe = await db.get(`SELECT id FROM recipes WHERE id = ?`, id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    const r = await db.run(
        `INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)`,
        id, req.user.id, String(content).trim()
    );
    const comment = await db.get(
        `SELECT c.id, c.content, c.created_at, u.username AS author
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
        r.lastID
    );
    res.status(201).json({ comment });
}));

app.get("/api/bookmarks", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    const rows = await db.all(
        `SELECT r.id, r.title, r.description, r.image_url, r.created_at, r.updated_at, u.username AS author
     FROM favorites f
     JOIN recipes r ON r.id = f.recipe_id
     JOIN users u ON u.id = r.user_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
        req.user.id
    );
    res.json({ recipes: rows });
}));

app.post("/api/bookmarks/:recipeId", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    const rid = Number(req.params.recipeId);
    const r = await db.get(`SELECT id FROM recipes WHERE id = ?`, rid);
    if (!r) return res.status(404).json({ error: "Recipe not found" });

    await db.run(`INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)`, req.user.id, rid);
    res.status(201).json({ ok: true });
}));

app.delete("/api/bookmarks/:recipeId", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    await db.run(`DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?`, req.user.id, Number(req.params.recipeId));
    res.json({ ok: true });
}));

app.get("/api/bookmarks/:recipeId", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();
    const row = await db.get(
        `SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ?`,
        req.user.id, Number(req.params.recipeId)
    );
    res.json({ bookmarked: !!row });
}));

app.get("/api/authors/:username", asyncHandler(async (req, res) => {
    const username = String(req.params.username || "").trim();
    if (!username) return res.status(400).json({ error: "username is required" });

    const db = await getDb();
    const author = await db.get(
        `SELECT id, username, email, created_at FROM users WHERE username = ?`,
        username
    );
    if (!author) return res.status(404).json({ error: "Author not found" });

    const followersCount = await db.get(
        `SELECT COUNT(*) AS c FROM follows WHERE followee_id = ?`,
        author.id
    );

    const recipes = await db.all(
        `SELECT r.id, r.title, r.description, r.image_url, r.created_at, r.updated_at
     FROM recipes r
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
        author.id
    );

    res.json({
        author: {
            id: author.id,
            username: author.username,
            joined_at: author.created_at,
            followers_count: followersCount?.c || 0
        },
        recipes
    });
}));

app.get("/api/follows/status/:username", authGuard, asyncHandler(async (req, res) => {
    const username = String(req.params.username || "").trim();
    const db = await getDb();
    const user = await db.get(`SELECT id FROM users WHERE username = ?`, username);
    if (!user) return res.status(404).json({ error: "User not found" });
    const row = await db.get(
        `SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?`,
        req.user.id, user.id
    );
    res.json({ following: !!row });
}));

app.post("/api/follows/:username", authGuard, asyncHandler(async (req, res) => {
    const username = String(req.params.username || "").trim();
    const db = await getDb();
    const target = await db.get(`SELECT id FROM users WHERE username = ?`, username);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.id === req.user.id) return res.status(400).json({ error: "Cannot follow yourself" });

    await db.run(
        `INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)`,
        req.user.id, target.id
    );
    res.status(201).json({ ok: true });
}));

app.delete("/api/follows/:username", authGuard, asyncHandler(async (req, res) => {
    const username = String(req.params.username || "").trim();
    const db = await getDb();
    const target = await db.get(`SELECT id FROM users WHERE username = ?`, username);
    if (!target) return res.status(404).json({ error: "User not found" });

    await db.run(
        `DELETE FROM follows WHERE follower_id = ? AND followee_id = ?`,
        req.user.id, target.id
    );
    res.json({ ok: true });
}));

app.get("/api/follows", authGuard, asyncHandler(async (req, res) => {
    const db = await getDb();

    const following = await db.all(
        `SELECT u.id, u.username, u.email, f.created_at
         FROM follows f
                  JOIN users u ON u.id = f.followee_id
         WHERE f.follower_id = ?
         ORDER BY f.created_at DESC`,
        req.user.id
    );

    const followers = await db.all(
        `SELECT u.id, u.username, u.email, f.created_at
         FROM follows f
         JOIN users u ON u.id = f.follower_id
         WHERE f.followee_id = ?
         ORDER BY f.created_at DESC`,
        req.user.id
    );

    res.json({ following, followers });
}));

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
});

initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Recipe World API running on http://localhost:${PORT}`);
        });
    })
    .catch((e) => {
        console.error("Failed to initialize database:", e);
        process.exit(1);
    });

export default app;