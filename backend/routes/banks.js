// backend/routes/banks.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const authenticateToken = require("../middleware/auth");

// Ruta para obtener todos los bancos
router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM bancos";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener bancos:", err);
      res.status(500).send("Error al obtener bancos");
      return;
    }
    res.json(results.rows);
  });
});

// Ruta para agregar un banco
router.post("/", authenticateToken, (req, res) => {
  const { nombre, saldo_total } = req.body;

  // Consulta para verificar si el banco ya existe
  const checkQuery = "SELECT * FROM bancos WHERE nombre = $1";
  connection.query(checkQuery, [nombre], (err, result) => {
    if (err) {
      console.error("Error al verificar banco existente:", err);
      return res.status(500).send("Error al verificar banco");
    }

    if (result.rows.length > 0) {
      // Si el banco ya existe, devolvemos un error
      return res.status(400).send("Ya existe un banco con este nombre");
    }

    // Si el banco no existe, procedemos a insertarlo
    const insertQuery =
      "INSERT INTO bancos (nombre, saldo_total) VALUES ($1, $2) RETURNING banco_id";
    connection.query(insertQuery, [nombre, saldo_total], (err, result) => {
      if (err) {
        console.error("Error al agregar banco:", err);
        return res.status(500).send("Error al agregar banco");
      }

      res.json({
        banco_id: result.rows[0].banco_id,
        nombre,
        saldo_total,
      });
    });
  });
});

// Ruta para actualizar un banco
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombre, saldo_total } = req.body;

  // Consulta para verificar si otro banco tiene el mismo nombre
  const checkQuery =
    "SELECT * FROM bancos WHERE nombre = $1 AND banco_id != $2";
  connection.query(checkQuery, [nombre, id], (err, result) => {
    if (err) {
      console.error("Error al verificar banco existente:", err);
      return res.status(500).send("Error al verificar banco");
    }

    if (result.rows.length > 0) {
      // Si otro banco ya existe con el nuevo nombre, devolvemos un error
      return res.status(400).send("Ya existe otro banco con este nombre");
    }

    // Si no existe otro banco con el mismo nombre, procedemos a actualizarlo
    const updateQuery =
      "UPDATE bancos SET nombre = $1, saldo_total = $2 WHERE banco_id = $3";
    connection.query(updateQuery, [nombre, saldo_total, id], (err, result) => {
      if (err) {
        console.error("Error al actualizar banco:", err);
        return res.status(500).send("Error al actualizar banco");
      }

      if (result.rowCount === 0) {
        return res.status(404).send("Banco no encontrado");
      }

      res.sendStatus(200); // Banco actualizado con éxito
    });
  });
});

// Ruta para eliminar un banco
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM bancos WHERE banco_id = $1";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar banco:", err);
      res.status(500).send("Error al eliminar banco");
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;
