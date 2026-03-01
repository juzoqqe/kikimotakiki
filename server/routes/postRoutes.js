const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ========= GET MY POSTS ========= */

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const posts = await pool.query(
      "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );

    res.json(posts.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения постов" });
  }
});

/* ========= MULTER ========= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ========= UPLOAD ========= */

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;

      const newPost = await pool.query(
        `INSERT INTO posts (user_id, image_url, title, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.user.userId, imageUrl, title, description]
      );

      res.json(newPost.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка загрузки" });
    }
  }
);

/* ========= DELETE ========= */

router.delete("/:id", authMiddleware, async (req, res) => {
  await pool.query(
    "DELETE FROM posts WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.userId]
  );

  res.json({ success: true });
});

/* ========= COMMENTS ========= */

router.get("/:id/comments", async (req, res) => {
  const comments = await pool.query(
    `SELECT comments.*, users.username
     FROM comments
     JOIN users ON comments.user_id = users.id
     WHERE post_id = $1
     ORDER BY created_at DESC`,
    [req.params.id]
  );

  res.json(comments.rows);
});

router.post("/:id/comment", authMiddleware, async (req, res) => {
  const { content } = req.body;

  await pool.query(
    `INSERT INTO comments (user_id, post_id, content)
     VALUES ($1, $2, $3)`,
    [req.user.userId, req.params.id, content]
  );

  res.json({ success: true });
});

/* ========= LIKES ========= */

router.post("/:id/like", authMiddleware, async (req, res) => {
  await pool.query(
    `INSERT INTO likes (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [req.user.userId, req.params.id]
  );

  res.json({ success: true });
});

router.get("/:id/likes", async (req, res) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM likes WHERE post_id = $1",
    [req.params.id]
  );

  res.json({ count: result.rows[0].count });
});

module.exports = router;