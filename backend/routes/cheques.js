const express = require("express");
const router = express.Router();
const connection = require("../db"); // Asumo que este archivo ya contiene la conexión a PostgreSQL
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");
// Ruta para obtener todos los cheques
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;
  const query =
    "SELECT * FROM cheques WHERE session_id IS NULL OR session_id = $1";
  connection.query(query, [sessionId], (err, result) => {
    if (err) return res.status(500).send("Error al obtener cheques");
    res.json(result.rows);
  });
});

router.post("/", limitarAccionesDemo, (req, res) => {
  const { numero } = req.body;
  const sessionId = res.locals.session_id;
  if (!numero) return res.status(400).send("Número requerido");

  const insertQuery =
    "INSERT INTO cheques (numero, session_id) VALUES ($1, $2) RETURNING cheque_id";
  connection.query(insertQuery, [numero, sessionId], (err, result) => {
    if (err) return res.status(500).send("Error al agregar cheque");
    res.json({ cheque_id: result.rows[0].cheque_id });
  });
});

module.exports = router;
