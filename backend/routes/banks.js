const express = require("express");
const router = express.Router();
const connection = require("../db");
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");

// Ruta para obtener todos los bancos visibles al usuario actual
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query = `SELECT * FROM bancos WHERE session_id IS NULL OR session_id = $1`;
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      console.error("Error al obtener bancos:", err);
      return res.status(500).send("Error al obtener bancos");
    }

    res.json(results.rows);
  });
});

// Ruta para agregar un banco
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
      return res.status(500).json({ error: err.message });
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
          console.error("Error en INSERT:", err);
          return res.status(500).json({ error: err.message });
        }

        res.json(result.rows[0]);
      }
    );
  });
});

// Ruta para actualizar un banco
router.put("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const { nombre, saldo_total } = req.body;
  const sessionId = res.locals.session_id;

  // Primero verificar si el banco pertenece al usuario
  const checkOwnerQuery = `SELECT session_id FROM bancos WHERE banco_id = $1`;
  connection.query(checkOwnerQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar propietario del banco:", err);
      return res.status(500).send("Error interno del servidor");
    }

    const banco = result.rows[0];
    if (!banco) return res.status(404).send("Banco no encontrado");

    if (banco.session_id === null) {
      return res
        .status(403)
        .send("No se puede editar bancos base del sistema.");
    }

    if (banco.session_id !== sessionId) {
      return res.status(403).send("No autorizado para modificar este banco.");
    }

    const updateQuery =
      "UPDATE bancos SET nombre = $1, saldo_total = $2 WHERE banco_id = $3";
    connection.query(updateQuery, [nombre, saldo_total, id], (err, result) => {
      if (err) {
        console.error("Error al actualizar banco:", err);
        return res.status(500).send("Error al actualizar banco");
      }

      res.sendStatus(200);
    });
  });
});

// Ruta para eliminar un banco
router.delete("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  const checkQuery = "SELECT session_id FROM bancos WHERE banco_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar session_id del banco:", err);
      return res.status(500).send("Error interno del servidor");
    }

    const banco = result.rows[0];
    if (!banco) return res.status(404).send("Banco no encontrado");

    if (banco.session_id === null) {
      return res
        .status(403)
        .send("No se puede eliminar bancos base del sistema.");
    }

    if (banco.session_id !== sessionId) {
      return res.status(403).send("No autorizado para eliminar este banco.");
    }

    const deleteQuery = "DELETE FROM bancos WHERE banco_id = $1";
    connection.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar banco:", err);
        return res.status(500).send("Error al eliminar banco");
      }
      res.sendStatus(200);
    });
  });
});

module.exports = router;
