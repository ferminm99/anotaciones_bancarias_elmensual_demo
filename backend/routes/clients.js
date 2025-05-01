// backend/routes/clients.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");
// Ruta para obtener todos los clientes
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query =
    "SELECT * FROM clientes WHERE session_id IS NULL OR session_id = $1";
  connection.query(query, [sessionId], (err, results) => {
    if (err) return res.status(500).send("Error al obtener clientes");
    res.json(results.rows);
  });
});

router.post("/", limitarAccionesDemo, (req, res) => {
  const { nombre, apellido } = req.body;
  const sessionId = res.locals.session_id;

  const query =
    "INSERT INTO clientes (nombre, apellido, session_id) VALUES ($1, $2, $3) RETURNING cliente_id";
  connection.query(query, [nombre, apellido, sessionId], (err, result) => {
    if (err) return res.status(500).send("Error al agregar cliente");
    res.json({ cliente_id: result.rows[0].cliente_id, nombre, apellido });
  });
});

router.put("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido } = req.body;
  const sessionId = res.locals.session_id;

  connection.query(
    "SELECT session_id FROM clientes WHERE cliente_id = $1",
    [id],
    (err, result) => {
      if (err) return res.status(500).send("Error interno");
      const cliente = result.rows[0];
      if (!cliente) return res.status(404).send("Cliente no encontrado");
      if (cliente.session_id === null)
        return res.status(403).send("No se puede editar clientes base");
      if (cliente.session_id !== sessionId)
        return res.status(403).send("No autorizado");

      const query =
        "UPDATE clientes SET nombre = $1, apellido = $2 WHERE cliente_id = $3";
      connection.query(query, [nombre, apellido, id], (err) => {
        if (err) return res.status(500).send("Error al actualizar cliente");
        res.sendStatus(200);
      });
    }
  );
});

router.delete("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  connection.query(
    "SELECT session_id FROM clientes WHERE cliente_id = $1",
    [id],
    (err, result) => {
      if (err) return res.status(500).send("Error interno");
      const cliente = result.rows[0];
      if (!cliente) return res.status(404).send("Cliente no encontrado");
      if (cliente.session_id === null)
        return res.status(403).send("No se puede eliminar clientes base");
      if (cliente.session_id !== sessionId)
        return res.status(403).send("No autorizado");

      connection.query(
        "DELETE FROM clientes WHERE cliente_id = $1",
        [id],
        (err) => {
          if (err) return res.status(500).send("Error al eliminar cliente");
          res.sendStatus(200);
        }
      );
    }
  );
});

module.exports = router;
