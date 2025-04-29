const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Conexión a tu base de datos
const authenticateToken = require("../middleware/auth");
const router = express.Router();

// Cargar la clave secreta del archivo .env
const JWT_SECRET = process.env.JWT_SECRET;
//const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

// Registro de usuario
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Encriptar la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar el usuario con la contraseña encriptada
  try {
    const query =
      "INSERT INTO usuarios (username, password) VALUES ($1, $2) RETURNING *";
    const values = [username, hashedPassword];
    const result = await db.query(query, values);
    res
      .status(201)
      .json({ message: "Usuario registrado", user: result.rows[0] });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  console.log("Iniciando autenticación"); // Primer paso
  const { username, password } = req.body;
  console.log("Datos recibidos:", username, password); // Log datos

  try {
    // Obtener el usuario de la base de datos
    const query = "SELECT * FROM usuarios WHERE username = $1";
    const result = await db.query(query, [username]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { id: user.usuario_id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Endpoint para validar el token
router.get("/validate-token", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token válido" });
});

module.exports = router;
