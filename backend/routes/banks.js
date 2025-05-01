// backend/routes/bancos.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");

// GET bancos (solo los visibles para el usuario)
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query = `SELECT * FROM bancos WHERE session_id IS NULL OR session_id = $1`;
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      console.error("Error al obtener bancos:", err);
      return res.status(500).json({ error: "Error al obtener bancos" });
    }
    res.json(results.rows);
  });
});

// POST banco
router.post("/", limitarAccionesDemo, (req, res) => {
  const { nombre, saldo_total } = req.body;
  const sessionId = res.locals.session_id;

  if (!nombre || saldo_total == null) {
    return res
      .status(400)
      .json({ error: "Faltan datos: nombre o saldo_total" });
  }

  const checkQuery =
    "SELECT * FROM bancos WHERE nombre = $1 AND (session_id IS NULL OR session_id = $2)";
  connection.query(checkQuery, [nombre, sessionId], (err, result) => {
    if (err) {
      console.error("Error en SELECT:", err);
      return res
        .status(500)
        .json({ error: "Error al verificar existencia del banco" });
    }

    if (result.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un banco con ese nombre" });
    }

    const insertQuery = `
      INSERT INTO bancos (nombre, saldo_total, session_id)
      VALUES ($1, $2, $3)
      RETURNING banco_id, nombre, saldo_total
    `;
    connection.query(
      insertQuery,
      [nombre, saldo_total, sessionId],
      (err, result) => {
        if (err) {
          console.error("Error al insertar banco:", err);
          return res.status(500).json({ error: "Error al insertar banco" });
        }
        res.status(201).json(result.rows[0]);
      }
    );
  });
});

// PUT banco
router.put("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const { nombre, saldo_total } = req.body;
  const sessionId = res.locals.session_id;

  const checkOwnerQuery = `SELECT session_id FROM bancos WHERE banco_id = $1`;
  connection.query(checkOwnerQuery, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error interno al verificar propietario" });

    const banco = result.rows[0];
    if (!banco) return res.status(404).json({ error: "Banco no encontrado" });

    if (banco.session_id === null)
      return res
        .status(403)
        .json({ error: "No se puede editar bancos base del sistema" });

    if (banco.session_id !== sessionId)
      return res
        .status(403)
        .json({ error: "No autorizado para modificar este banco" });

    const updateQuery =
      "UPDATE bancos SET nombre = $1, saldo_total = $2 WHERE banco_id = $3";
    connection.query(updateQuery, [nombre, saldo_total, id], (err) => {
      if (err)
        return res.status(500).json({ error: "Error al actualizar banco" });
      res.json({ message: "Banco actualizado con éxito" });
    });
  });
});

// DELETE banco
router.delete("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  const checkQuery = "SELECT session_id FROM bancos WHERE banco_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error interno al verificar banco" });

    const banco = result.rows[0];
    if (!banco) return res.status(404).json({ error: "Banco no encontrado" });

    if (banco.session_id === null)
      return res
        .status(403)
        .json({ error: "No se puede eliminar bancos base del sistema" });

    if (banco.session_id !== sessionId)
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este banco" });

    const deleteQuery = "DELETE FROM bancos WHERE banco_id = $1";
    connection.query(deleteQuery, [id], (err) => {
      if (err)
        return res.status(500).json({ error: "Error al eliminar banco" });
      res.json({ message: "Banco eliminado con éxito" });
    });
  });
});

module.exports = router;
