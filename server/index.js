const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// auth routes
app.use("/api/auth", authRoutes);

// 👇 ВОТ ЭТО ДОЛЖНО БЫТЬ
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, username, email, bio, avatar_url, banner_url
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Ошибка получения профиля" });
  }
});

app.use("/api/posts", postRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Server работает 🚀" });
});

const path = require("path");

app.use(express.static(
  path.join(__dirname, "../client/dist")
));

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client/dist/index.html")
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});