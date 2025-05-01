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

module.exports = router;
