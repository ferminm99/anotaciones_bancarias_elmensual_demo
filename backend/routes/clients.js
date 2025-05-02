const express = require("express");
const router = express.Router();
const connection = require("../db");
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");

// Obtener todos los clientes
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query =
    "SELECT * FROM clientes WHERE session_id IS NULL OR session_id = $1";
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      console.error("Error al obtener clientes:", err);
      return res.status(500).json({ error: "Error al obtener clientes" });
    }
    res.json(results.rows);
  });
});

// Agregar un nuevo cliente
router.post("/", limitarAccionesDemo, (req, res) => {
  const { nombre, apellido } = req.body;
  const sessionId = res.locals.session_id;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre del cliente requerido" });
  }

  const checkQuery =
    "SELECT * FROM clientes WHERE nombre = $1 AND apellido = $2 AND (session_id IS NULL OR session_id = $3)";
  connection.query(checkQuery, [nombre, apellido, sessionId], (err, result) => {
    if (err) {
      console.error("Error al verificar existencia del cliente:", err);
      return res
        .status(500)
        .json({ error: "Error al verificar existencia del cliente" });
    }

    if (result.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un cliente con ese nombre y apellido" });
    }

    const insertQuery =
      "INSERT INTO clientes (nombre, apellido, session_id) VALUES ($1, $2, $3) RETURNING cliente_id, nombre, apellido";
    connection.query(
      insertQuery,
      [nombre, apellido, sessionId],
      (err, result) => {
        if (err) {
          console.error("Error al agregar cliente:", err);
          return res.status(500).json({ error: "Error al agregar cliente" });
        }
        res.status(201).json(result.rows[0]);
      }
    );
  });
});

// Actualizar un cliente existente
router.put("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido } = req.body;
  const sessionId = res.locals.session_id;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre del cliente requerido" });
  }

  const checkQuery = "SELECT session_id FROM clientes WHERE cliente_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar cliente:", err);
      return res.status(500).json({ error: "Error al verificar cliente" });
    }

    const cliente = result.rows[0];
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (cliente.session_id === null) {
      return res
        .status(403)
        .json({ error: "No se puede editar clientes base del sistema" });
    }

    if (cliente.session_id !== sessionId) {
      return res
        .status(403)
        .json({ error: "No autorizado para modificar este cliente" });
    }

    const updateQuery =
      "UPDATE clientes SET nombre = $1, apellido = $2 WHERE cliente_id = $3";
    connection.query(updateQuery, [nombre, apellido, id], (err) => {
      if (err) {
        console.error("Error al actualizar cliente:", err);
        return res.status(500).json({ error: "Error al actualizar cliente" });
      }
      res.json({ message: "Cliente actualizado con éxito" });
    });
  });
});
// Eliminar un cliente existente
router.delete("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  const checkQuery = "SELECT session_id FROM clientes WHERE cliente_id = $1";
  connection.query(checkQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al verificar cliente:", err);
      return res.status(500).json({ error: "Error al verificar cliente" });
    }

    const cliente = result.rows[0];
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (cliente.session_id === null) {
      return res
        .status(403)
        .json({ error: "No se puede eliminar clientes base del sistema" });
    }

    if (cliente.session_id !== sessionId) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este cliente" });
    }

    const deleteQuery = "DELETE FROM clientes WHERE cliente_id = $1";
    connection.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error al eliminar cliente:", err);
        return res.status(500).json({ error: "Error al eliminar cliente" });
      }

      res.json({ message: "Cliente eliminado con éxito" });
    });
  });
});

module.exports = router;
