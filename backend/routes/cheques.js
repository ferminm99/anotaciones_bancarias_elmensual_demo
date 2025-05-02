const express = require("express");
const router = express.Router();
const connection = require("../db");

// Obtener todos los cheques
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query =
    "SELECT * FROM cheques WHERE session_id IS NULL OR session_id = $1";
  connection.query(query, [sessionId], (err, result) => {
    if (err) {
      console.error("Error al obtener cheques:", err);
      return res.status(500).json({ error: "Error al obtener cheques" });
    }
    res.json(result.rows);
  });
});

// Agregar un nuevo cheque
router.post("/", (req, res) => {
  const { numero } = req.body;
  const sessionId = res.locals.session_id;

  if (!numero) {
    return res.status(400).json({ error: "Número de cheque requerido" });
  }

  const checkQuery =
    "SELECT * FROM cheques WHERE numero = $1 AND (session_id IS NULL OR session_id = $2)";
  connection.query(checkQuery, [numero, sessionId], (err, result) => {
    if (err) {
      console.error("Error al verificar existencia del cheque:", err);
      return res
        .status(500)
        .json({ error: "Error al verificar existencia del cheque" });
    }

    if (result.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un cheque con ese número" });
    }

    const insertQuery =
      "INSERT INTO cheques (numero, session_id) VALUES ($1, $2) RETURNING cheque_id, numero";
    connection.query(insertQuery, [numero, sessionId], (err, result) => {
      if (err) {
        console.error("Error al agregar cheque:", err);
        return res.status(500).json({ error: "Error al agregar cheque" });
      }
      res.status(201).json(result.rows[0]);
    });
  });
});

// Actualizar un cheque existente
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { numero } = req.body;
  const sessionId = res.locals.session_id;

  if (!numero) {
    return res.status(400).json({ error: "Número de cheque requerido" });
  }

  const checkQuery = "SELECT session_id FROM cheques WHERE cheque_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar cheque:", err);
      return res.status(500).json({ error: "Error al verificar cheque" });
    }

    const cheque = result.rows[0];
    if (!cheque) {
      return res.status(404).json({ error: "Cheque no encontrado" });
    }

    if (cheque.session_id === null) {
      return res
        .status(403)
        .json({ error: "No se puede editar cheques base del sistema" });
    }

    if (cheque.session_id !== sessionId) {
      return res
        .status(403)
        .json({ error: "No autorizado para modificar este cheque" });
    }

    const updateQuery = "UPDATE cheques SET numero = $1 WHERE cheque_id = $2";
    connection.query(updateQuery, [numero, id], (err) => {
      if (err) {
        console.error("Error al actualizar cheque:", err);
        return res.status(500).json({ error: "Error al actualizar cheque" });
      }
      res.json({ message: "Cheque actualizado con éxito" });
    });
  });
});

// Eliminar un cheque existente
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  const checkQuery = "SELECT session_id FROM cheques WHERE cheque_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar cheque:", err);
      return res.status(500).json({ error: "Error al verificar cheque" });
    }

    const cheque = result.rows[0];
    if (!cheque) {
      return res.status(404).json({ error: "Cheque no encontrado" });
    }

    if (cheque.session_id === null) {
      return res
        .status(403)
        .json({ error: "No se puede eliminar cheques base del sistema" });
    }

    if (cheque.session_id !== sessionId) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este cheque" });
    }

    const deleteQuery = "DELETE FROM cheques WHERE cheque_id = $1";
    connection.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error al eliminar cheque:", err);
        return res.status(500).json({ error: "Error al eliminar cheque" });
      }
      res.json({ message: "Cheque eliminado con éxito" });
    });
  });
});

module.exports = router;
