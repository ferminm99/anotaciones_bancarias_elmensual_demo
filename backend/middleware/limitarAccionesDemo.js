const db = require("../db");

const MAX_ACCIONES_POR_DIA = 30;

const limitarAccionesDemo = async (req, res, next) => {
  if (process.env.DEMO_MODE !== "true") return next();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const sessionId = res.locals.session_id;
  const accion =
    req.method === "POST"
      ? "add"
      : req.method === "PUT"
      ? "edit"
      : req.method === "DELETE"
      ? "delete"
      : null;

  if (!accion) return next();

  try {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM acciones_demo 
       WHERE session_id = $1 AND accion = $2 AND fecha::date = CURRENT_DATE`,
      [sessionId, accion]
    );

    const cantidad = parseInt(rows[0].count, 10);

    if (cantidad >= MAX_ACCIONES_POR_DIA) {
      return res.status(429).json({
        error: "Límite diario alcanzado para esta acción en modo DEMO.",
      });
    }

    await db.query(
      `INSERT INTO acciones_demo (ip, accion, session_id) VALUES ($1, $2, $3)`,
      [ip, accion, sessionId]
    );
    console.log(
      "Seteando header x-acciones-restantes:",
      Math.max(0, MAX_ACCIONES_POR_DIA - cantidad - 1)
    );
    res.setHeader(
      "x-acciones-restantes",
      Math.max(0, MAX_ACCIONES_POR_DIA - cantidad - 1)
    );

    next();
  } catch (err) {
    console.error("Error en limitarAccionesDemo:", err);
    res.status(500).send("Error en control de acciones demo");
  }
};

module.exports = limitarAccionesDemo;
