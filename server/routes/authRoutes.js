const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const pool = require("../db");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =========================
   REGISTRATION
========================= */

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Все поля обязательны"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, avatar_url, banner_url`,
      [username, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        error: "Username или Email уже существует"
      });
    }

    res.status(500).json({
      error: "Ошибка регистрации"
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email и пароль обязательны"
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        error: "Пользователь не найден"
      });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({
        error: "Неверный пароль"
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url
      }
    });

  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      error: "Ошибка входа"
    });
  }
});

/* =========================
   UPDATE PROFILE TEXT
========================= */

router.put("/update-profile", authMiddleware, async (req, res) => {
  const { bio } = req.body;

  try {
    const updatedUser = await pool.query(
      `UPDATE users
       SET bio = $1
       WHERE id = $2
       RETURNING id, username, bio, avatar_url, banner_url`,
      [bio, req.user.userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Ошибка обновления профиля" });
  }
});

/* =========================
   UPDATE AVATAR + BANNER
========================= */

router.put(
  "/update-images",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const avatar = req.files?.avatar
        ? `/uploads/${req.files.avatar[0].filename}`
        : null;

      const banner = req.files?.banner
        ? `/uploads/${req.files.banner[0].filename}`
        : null;

      const updatedUser = await pool.query(
        `UPDATE users
         SET avatar_url = COALESCE($1, avatar_url),
             banner_url = COALESCE($2, banner_url)
         WHERE id = $3
         RETURNING avatar_url, banner_url`,
        [avatar, banner, req.user.userId]
      );

      res.json(updatedUser.rows[0]);
    } catch (err) {
      console.error("Image upload error:", err);
      res.status(500).json({ error: "Ошибка загрузки изображений" });
    }
  }
);

module.exports = router;