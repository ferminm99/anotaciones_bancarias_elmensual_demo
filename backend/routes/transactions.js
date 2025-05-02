// backend/routes/transacciones.js
const express = require("express");
const router = express.Router();
const connection = require("../db");

// GET: obtener transacciones visibles para la sesión
router.get("/", (req, res) => {
  const sessionId = res.locals.session_id;

  const query = `
    SELECT 
      transacciones.transaccion_id, 
      transacciones.fecha, 
      transacciones.tipo, 
      transacciones.monto, 
      transacciones.banco_id, 
      transacciones.cliente_id, 
      transacciones.cheque_id,
      transacciones.session_id,
      bancos.nombre AS nombre_banco,
      CONCAT(clientes.nombre, ' ', COALESCE(clientes.apellido, '')) AS nombre_cliente,
      cheques.numero AS numero_cheque
    FROM transacciones
    JOIN bancos ON transacciones.banco_id = bancos.banco_id
    LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
    LEFT JOIN cheques ON transacciones.cheque_id = cheques.cheque_id
    WHERE transacciones.session_id IS NULL OR transacciones.session_id = $1
  `;

  connection.query(query, [sessionId], (err, result) => {
    if (err) {
      console.error("Error al obtener transacciones:", err);
      return res.status(500).json({ error: "Error al obtener transacciones" });
    }
    res.json(result.rows);
  });
});

// POST: agregar transacción
router.post("/", (req, res) => {
  const {
    fecha,
    nombre_cliente,
    cliente_id,
    tipo,
    monto,
    banco_id,
    cheque_id,
  } = req.body;

  const sessionId = res.locals.session_id;
  const formattedFecha = fecha
    ? new Date(fecha).toISOString()
    : new Date().toISOString();

  function insertarTransaccion(clienteId, nombreCliente, chequeId) {
    const query = `
      INSERT INTO transacciones (fecha, cliente_id, tipo, monto, banco_id, cheque_id, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transaccion_id
    `;
    const values = [
      formattedFecha,
      clienteId,
      tipo,
      monto,
      banco_id,
      chequeId,
      sessionId,
    ];
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error al insertar transacción:", err);
        return res.status(500).json({ error: "Error al insertar transacción" });
      }
      res.status(201).json({
        message: "Transacción agregada con éxito",
        transaccion_id: result.rows[0].transaccion_id,
        cliente_id: clienteId,
        nombre_cliente: nombreCliente,
        banco_id,
        fecha: formattedFecha,
        tipo,
        monto,
        cheque_id: chequeId,
      });
    });
  }

  function manejarChequeYTransaccion(clienteId, nombreCliente) {
    if (tipo === "pago_cheque" && cheque_id) {
      connection.query(
        "SELECT cheque_id FROM cheques WHERE numero = $1",
        [cheque_id],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "Error al buscar cheque" });

          if (result.rows.length > 0) {
            insertarTransaccion(
              clienteId,
              nombreCliente,
              result.rows[0].cheque_id
            );
          } else {
            connection.query(
              "INSERT INTO cheques (numero, session_id) VALUES ($1, $2) RETURNING cheque_id",
              [cheque_id, sessionId],
              (err, result) => {
                if (err)
                  return res
                    .status(500)
                    .json({ error: "Error al insertar cheque" });
                insertarTransaccion(
                  clienteId,
                  nombreCliente,
                  result.rows[0].cheque_id
                );
              }
            );
          }
        }
      );
    } else {
      insertarTransaccion(clienteId, nombreCliente, null);
    }
  }

  function manejarCliente() {
    if (cliente_id) {
      connection.query(
        "SELECT nombre, apellido FROM clientes WHERE cliente_id = $1",
        [cliente_id],
        (err, result) => {
          if (err || result.rows.length === 0)
            return res
              .status(500)
              .json({ error: "Error al obtener nombre del cliente" });
          const nombreCompleto = `${result.rows[0].nombre} ${
            result.rows[0].apellido || ""
          }`.trim();
          manejarChequeYTransaccion(cliente_id, nombreCompleto);
        }
      );
    } else if (!nombre_cliente || nombre_cliente.trim() === "") {
      manejarChequeYTransaccion(null, null);
    } else {
      const [nombre, ...resto] = nombre_cliente.trim().split(" ");
      const apellido = resto.join(" ") || null;
      connection.query(
        `SELECT cliente_id FROM clientes WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)`,
        [nombre, apellido],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "Error al buscar cliente" });

          if (result.rows.length > 0) {
            manejarChequeYTransaccion(
              result.rows[0].cliente_id,
              nombre_cliente
            );
          } else {
            connection.query(
              `INSERT INTO clientes (nombre, apellido, session_id) VALUES ($1, $2, $3) RETURNING cliente_id`,
              [nombre, apellido, sessionId],
              (err, result) => {
                if (err)
                  return res
                    .status(500)
                    .json({ error: "Error al insertar cliente" });
                manejarChequeYTransaccion(
                  result.rows[0].cliente_id,
                  nombre_cliente
                );
              }
            );
          }
        }
      );
    }
  }

  manejarCliente();
});

// PUT: actualizar transacción si es del usuario
router.put("/:transaccion_id", (req, res) => {
  const { transaccion_id } = req.params;
  const {
    fecha,
    nombre_cliente,
    cliente_id,
    tipo,
    monto,
    banco_id,
    cheque_id,
    numero_cheque,
  } = req.body;
  const sessionId = res.locals.session_id;

  connection.query(
    "SELECT session_id FROM transacciones WHERE transaccion_id = $1",
    [transaccion_id],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al verificar propiedad" });
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Transacción no encontrada" });

      const trans = result.rows[0];
      if (trans.session_id === null)
        return res
          .status(403)
          .json({ error: "No se puede editar una transacción base" });
      if (trans.session_id !== sessionId)
        return res.status(403).json({ error: "No autorizado" });

      continuarActualizacion();
    }
  );

  function continuarActualizacion() {
    const formattedFecha = fecha
      ? new Date(fecha).toISOString()
      : new Date().toISOString();

    function manejarCliente(callback) {
      if (cliente_id) return callback(cliente_id);
      if (!nombre_cliente || nombre_cliente.trim() === "")
        return callback(null);

      const [nombre, ...resto] = nombre_cliente.split(" ");
      const apellido = resto.join(" ") || null;

      connection.query(
        "SELECT cliente_id FROM clientes WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)",
        [nombre, apellido],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "Error al buscar cliente" });

          if (result.rows.length > 0)
            return callback(result.rows[0].cliente_id);

          connection.query(
            "INSERT INTO clientes (nombre, apellido, session_id) VALUES ($1, $2, $3) RETURNING cliente_id",
            [nombre, apellido, sessionId],
            (err, result) => {
              if (err)
                return res
                  .status(500)
                  .json({ error: "Error al insertar cliente" });
              callback(result.rows[0].cliente_id);
            }
          );
        }
      );
    }

    function manejarChequeYActualizar(clienteFinalId) {
      if (tipo === "pago_cheque" && numero_cheque) {
        connection.query(
          "SELECT cheque_id, numero FROM cheques WHERE cheque_id = $1",
          [cheque_id],
          (err, result) => {
            if (err)
              return res.status(500).json({ error: "Error al buscar cheque" });

            if (
              result.rows.length > 0 &&
              result.rows[0].numero !== numero_cheque
            ) {
              connection.query(
                "UPDATE cheques SET numero = $1 WHERE cheque_id = $2",
                [numero_cheque, cheque_id],
                (err) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ error: "Error al actualizar cheque" });
                  actualizarTransaccion(cheque_id, clienteFinalId);
                }
              );
            } else if (result.rows.length > 0) {
              actualizarTransaccion(cheque_id, clienteFinalId);
            } else {
              connection.query(
                "INSERT INTO cheques (numero, session_id) VALUES ($1, $2) RETURNING cheque_id",
                [numero_cheque, sessionId],
                (err, result) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ error: "Error al insertar cheque" });
                  actualizarTransaccion(
                    result.rows[0].cheque_id,
                    clienteFinalId
                  );
                }
              );
            }
          }
        );
      } else {
        actualizarTransaccion(null, clienteFinalId);
      }
    }

    function actualizarTransaccion(chequeId, clienteId) {
      const query = `
        UPDATE transacciones SET fecha = $1, cliente_id = $2, tipo = $3, monto = $4, banco_id = $5, cheque_id = $6
        WHERE transaccion_id = $7
      `;
      const values = [
        formattedFecha,
        clienteId,
        tipo,
        monto,
        banco_id,
        chequeId,
        transaccion_id,
      ];
      connection.query(query, values, (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error al actualizar transacción" });

        res.json({
          message: "Transacción actualizada con éxito",
          transaccion_id: Number(transaccion_id),
          cliente_id: clienteId,
          nombre_cliente,
          banco_id,
          fecha: formattedFecha,
          tipo,
          monto,
          cheque_id: chequeId,
        });
      });
    }

    manejarCliente((clienteFinal) => {
      manejarChequeYActualizar(clienteFinal);
    });
  }
});

// DELETE: eliminar transacción si es del usuario
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  connection.query(
    "SELECT cheque_id, session_id FROM transacciones WHERE transaccion_id = $1",
    [id],
    (err, result) => {
      if (err || result.rows.length === 0)
        return res.status(404).json({ error: "Transacción no encontrada" });

      const { cheque_id, session_id } = result.rows[0];
      if (session_id === null)
        return res
          .status(403)
          .json({ error: "No se puede eliminar una transacción base" });

      if (session_id !== sessionId)
        return res.status(403).json({ error: "No autorizado" });

      connection.query(
        "DELETE FROM transacciones WHERE transaccion_id = $1",
        [id],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Error al eliminar transacción" });

          if (cheque_id) {
            connection.query(
              "DELETE FROM cheques WHERE cheque_id = $1",
              [cheque_id],
              (err) => {
                if (err)
                  return res
                    .status(500)
                    .json({ error: "Error al eliminar cheque" });
                res.json({ message: "Transacción y cheque eliminados" });
              }
            );
          } else {
            res.json({ message: "Transacción eliminada" });
          }
        }
      );
    }
  );
});

module.exports = router;
