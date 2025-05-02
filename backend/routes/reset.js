// backend/routes/demoReset.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// IDs protegidos
const BANCOS_PROTEGIDOS = [1, 2];
const CLIENTES_PROTEGIDOS = [1, 2, 3];
const TRANSACCIONES_PROTEGIDAS = [1, 2, 3, 4, 5];

router.post("/reset-demo", async (req, res) => {
  try {
    // Eliminar transacciones excepto protegidas
    await db.query(
      `DELETE FROM transacciones WHERE transaccion_id NOT IN (${TRANSACCIONES_PROTEGIDAS.join(
        ","
      )})`
    );

    // Eliminar cheques completamente (sin cheque_id protegido)
    await db.query(`DELETE FROM cheques`);

    // Eliminar clientes excepto protegidos
    await db.query(
      `DELETE FROM clientes WHERE cliente_id NOT IN (${CLIENTES_PROTEGIDOS.join(
        ","
      )})`
    );

    // Eliminar bancos excepto protegidos
    await db.query(
      `DELETE FROM bancos WHERE banco_id NOT IN (${BANCOS_PROTEGIDOS.join(
        ","
      )})`
    );

    // Limpiar acciones demo
    await db.query(`DELETE FROM acciones_demo`);

    res.json({ message: "Demo reseteado correctamente." });
  } catch (err) {
    console.error("Error al resetear demo:", err);
    res.status(500).send("Error al resetear datos de demo");
  }
});

router.get("/acciones-restantes", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const sessionId = res.locals.session_id;
  const DEMO_MODE = process.env.DEMO_MODE === "true";

  if (!DEMO_MODE) return res.json({ restantes: null });

  try {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM acciones_demo 
         WHERE (ip = $1 OR session_id = $2) 
           AND fecha::date = CURRENT_DATE`,
      [ip, sessionId]
    );

    const cantidad = parseInt(rows[0].count, 10);
    const restantes = Math.max(0, 30 - cantidad);

    res.json({ restantes });
  } catch (err) {
    console.error("Error al obtener acciones restantes:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
