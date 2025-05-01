// backend/routes/transacciones.js
const express = require("express");
const router = express.Router();
const connection = require("../db");
const limitarAccionesDemo = require("../middleware/limitarAccionesDemo");

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
      return res.status(500).send("Error al obtener transacciones");
    }
    res.json(result.rows);
  });
});

// POST: agregar transacción
router.post("/", limitarAccionesDemo, (req, res) => {
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

  function insertarTransaccion(
    cliente_id_final,
    nombre_cliente_final,
    cheque_id_final
  ) {
    const query = `
      INSERT INTO transacciones (fecha, cliente_id, tipo, monto, banco_id, cheque_id, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transaccion_id
    `;
    connection.query(
      query,
      [
        formattedFecha,
        cliente_id_final,
        tipo,
        monto,
        banco_id,
        cheque_id_final,
        sessionId,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar transacción:", err);
          return res.status(500).send("Error al insertar transacción");
        }

        res.json({
          message: "Transacción agregada con éxito",
          transaccion_id: result.rows[0].transaccion_id,
          cliente_id: cliente_id_final,
          nombre_cliente: nombre_cliente_final,
          banco_id,
          fecha: formattedFecha,
          tipo,
          monto,
          cheque_id: cheque_id_final,
        });
      }
    );
  }

  function manejarChequeYTransaccion(cliente_id_final, nombre_cliente_final) {
    if (tipo === "pago_cheque" && cheque_id) {
      const queryCheque = "SELECT cheque_id FROM cheques WHERE numero = $1";
      connection.query(queryCheque, [cheque_id], (err, result) => {
        if (err) {
          console.error("Error al buscar cheque:", err);
          return res.status(500).send("Error al buscar cheque");
        }

        if (result.rows.length > 0) {
          insertarTransaccion(
            cliente_id_final,
            nombre_cliente_final,
            result.rows[0].cheque_id
          );
        } else {
          const insertCheque = `
            INSERT INTO cheques (numero, session_id)
            VALUES ($1, $2)
            RETURNING cheque_id
          `;
          connection.query(
            insertCheque,
            [cheque_id, sessionId],
            (err, result) => {
              if (err) {
                console.error("Error al insertar cheque:", err);
                return res.status(500).send("Error al insertar cheque");
              }
              insertarTransaccion(
                cliente_id_final,
                nombre_cliente_final,
                result.rows[0].cheque_id
              );
            }
          );
        }
      });
    } else {
      insertarTransaccion(cliente_id_final, nombre_cliente_final, null);
    }
  }

  function manejarCliente() {
    if (cliente_id) {
      connection.query(
        "SELECT nombre, apellido FROM clientes WHERE cliente_id = $1",
        [cliente_id],
        (err, result) => {
          if (err || result.rows.length === 0) {
            return res.status(500).send("Error al obtener nombre del cliente");
          }
          const nombreCompleto = `${result.rows[0].nombre} ${
            result.rows[0].apellido || ""
          }`.trim();
          manejarChequeYTransaccion(cliente_id, nombreCompleto);
        }
      );
    } else if (!nombre_cliente || nombre_cliente.trim() === "") {
      manejarChequeYTransaccion(null, null);
    } else {
      const [nombre, ...resto] = nombre_cliente.split(" ");
      const apellido = resto.join(" ") || null;

      const queryBuscar = `
        SELECT cliente_id FROM clientes 
        WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)
      `;
      connection.query(queryBuscar, [nombre, apellido], (err, result) => {
        if (err) return res.status(500).send("Error al buscar cliente");

        if (result.rows.length > 0) {
          manejarChequeYTransaccion(result.rows[0].cliente_id, nombre_cliente);
        } else {
          const queryInsert = `
            INSERT INTO clientes (nombre, apellido, session_id)
            VALUES ($1, $2, $3) RETURNING cliente_id
          `;
          connection.query(
            queryInsert,
            [nombre, apellido, sessionId],
            (err, result) => {
              if (err) return res.status(500).send("Error al insertar cliente");
              manejarChequeYTransaccion(
                result.rows[0].cliente_id,
                nombre_cliente
              );
            }
          );
        }
      });
    }
  }

  manejarCliente();
});

// PUT: actualizar transacción si es del usuario
router.put("/:transaccion_id", limitarAccionesDemo, (req, res) => {
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

  // Validar que el usuario tenga permiso
  const checkQuery =
    "SELECT session_id FROM transacciones WHERE transaccion_id = $1";
  connection.query(checkQuery, [transaccion_id], (err, result) => {
    if (err) return res.status(500).send("Error al verificar propiedad");
    if (result.rows.length === 0)
      return res.status(404).send("Transacción no encontrada");

    const row = result.rows[0];

    if (row.session_id === null) {
      return res.status(403).send("No se puede editar una transacción base");
    }

    if (row.session_id !== sessionId) {
      return res.status(403).send("No autorizado");
    }

    continuarActualizacion();
  });

  function continuarActualizacion() {
    const formattedFecha = fecha
      ? new Date(fecha).toISOString()
      : new Date().toISOString();

    function manejarCliente(callback) {
      if (cliente_id) {
        callback(cliente_id);
      } else if (!nombre_cliente || nombre_cliente.trim() === "") {
        callback(null);
      } else {
        const clienteDividido = nombre_cliente.split(" ");
        const nombre = clienteDividido.slice(0, -1).join(" ");
        const apellido = clienteDividido.slice(-1).join(" ") || null;

        const buscarCliente = `
          SELECT cliente_id FROM clientes
          WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)
        `;
        connection.query(buscarCliente, [nombre, apellido], (err, result) => {
          if (err) return res.status(500).send("Error al buscar cliente");

          if (result.rows.length > 0) {
            callback(result.rows[0].cliente_id);
          } else {
            const insertarCliente = `
              INSERT INTO clientes (nombre, apellido, session_id)
              VALUES ($1, $2, $3) RETURNING cliente_id
            `;
            connection.query(
              insertarCliente,
              [nombre, apellido, sessionId],
              (err, result) => {
                if (err)
                  return res.status(500).send("Error al insertar cliente");
                callback(result.rows[0].cliente_id);
              }
            );
          }
        });
      }
    }

    function manejarChequeYActualizar(cliente_id_final) {
      if (tipo === "pago_cheque" && numero_cheque) {
        const buscarCheque =
          "SELECT cheque_id, numero FROM cheques WHERE cheque_id = $1";
        connection.query(buscarCheque, [cheque_id], (err, result) => {
          if (err)
            return res.status(500).send("Error al buscar cheque existente");

          if (result.rows.length > 0) {
            const cheque = result.rows[0];
            if (cheque.numero !== String(numero_cheque)) {
              const actualizarCheque =
                "UPDATE cheques SET numero = $1 WHERE cheque_id = $2";
              connection.query(
                actualizarCheque,
                [numero_cheque, cheque_id],
                (err) => {
                  if (err)
                    return res.status(500).send("Error al actualizar cheque");
                  actualizarTransaccion(cheque_id, cliente_id_final);
                }
              );
            } else {
              actualizarTransaccion(cheque_id, cliente_id_final);
            }
          } else {
            const insertarCheque = `
              INSERT INTO cheques (numero, session_id) VALUES ($1, $2)
              RETURNING cheque_id
            `;
            connection.query(
              insertarCheque,
              [numero_cheque, sessionId],
              (err, result) => {
                if (err)
                  return res.status(500).send("Error al insertar nuevo cheque");
                actualizarTransaccion(
                  result.rows[0].cheque_id,
                  cliente_id_final
                );
              }
            );
          }
        });
      } else {
        actualizarTransaccion(null, cliente_id_final);
      }
    }

    function actualizarTransaccion(chequeIdFinal, clienteIdFinal) {
      const updateQuery = `
        UPDATE transacciones
        SET fecha = $1, cliente_id = $2, tipo = $3, monto = $4, banco_id = $5, cheque_id = $6
        WHERE transaccion_id = $7
      `;
      const values = [
        formattedFecha,
        clienteIdFinal,
        tipo,
        monto,
        banco_id,
        chequeIdFinal,
        transaccion_id,
      ];

      connection.query(updateQuery, values, (err) => {
        if (err) return res.status(500).send("Error al actualizar transacción");

        res.json({
          message: "Transacción actualizada con éxito",
          transaccion_id: Number(transaccion_id),
          cliente_id: clienteIdFinal,
          nombre_cliente: nombre_cliente,
          banco_id,
          fecha: formattedFecha,
          tipo,
          monto,
          cheque_id: chequeIdFinal,
        });
      });
    }

    manejarCliente((clienteFinal) => {
      manejarChequeYActualizar(clienteFinal);
    });
  }
});

// DELETE: eliminar transacción si es del usuario
router.delete("/:id", limitarAccionesDemo, (req, res) => {
  const { id } = req.params;
  const sessionId = res.locals.session_id;

  const getQuery =
    "SELECT cheque_id, session_id FROM transacciones WHERE transaccion_id = $1";
  connection.query(getQuery, [id], (err, result) => {
    if (err || result.rows.length === 0) {
      return res.status(404).send("Transacción no encontrada");
    }

    const { cheque_id, session_id } = result.rows[0];

    if (session_id === null) {
      return res.status(403).send("No se puede eliminar una transacción base");
    }

    if (session_id !== sessionId) {
      return res.status(403).send("No autorizado");
    }

    connection.query(
      "DELETE FROM transacciones WHERE transaccion_id = $1",
      [id],
      (err) => {
        if (err) return res.status(500).send("Error al eliminar transacción");

        if (cheque_id) {
          connection.query(
            "DELETE FROM cheques WHERE cheque_id = $1",
            [cheque_id],
            (err) => {
              if (err) return res.status(500).send("Error al eliminar cheque");
              res.json({ message: "Transacción y cheque eliminados" });
            }
          );
        } else {
          res.json({ message: "Transacción eliminada" });
        }
      }
    );
  });
});

module.exports = router;
