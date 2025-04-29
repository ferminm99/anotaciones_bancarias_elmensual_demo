const jwt = require("jsonwebtoken");
const db = require("../db"); // Asegúrate de importar la conexión a la base de datos

const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    // Verificar si el token es válido
    const user = jwt.verify(token, SECRET_KEY);

    // Verificar si el token ha sido revocado en la base de datos
    const isRevoked = await db.query(
      "SELECT token FROM revoked_tokens WHERE token = $1",
      [token]
    );

    if (isRevoked.rows.length > 0) {
      return res.status(403).json({ error: "Token revocado" });
    }

    req.user = user; // Adjuntar el usuario al request
    next(); // Continuar con la siguiente función middleware
  } catch (error) {
    console.error("Error al autenticar el token:", error);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authenticateToken;
