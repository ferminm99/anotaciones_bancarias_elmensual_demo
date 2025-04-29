const express = require("express");
const router = express.Router();
const connection = require("../db");
const authenticateToken = require("../middleware/auth");

// Ruta para obtener todas las transacciones
router.get("/", authenticateToken, (req, res) => {
  const query = `
    SELECT 
      transacciones.transaccion_id AS transaccion_id, 
      transacciones.fecha, 
      transacciones.tipo, 
      transacciones.monto, 
      transacciones.banco_id,      
      transacciones.cliente_id,   
      transacciones.cheque_id,     
      bancos.nombre AS nombre_banco, 
      CONCAT(clientes.nombre, ' ', COALESCE(clientes.apellido, '')) AS nombre_cliente,
      cheques.numero AS numero_cheque
    FROM transacciones
    JOIN bancos ON transacciones.banco_id = bancos.banco_id
    LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
    LEFT JOIN cheques ON transacciones.cheque_id = cheques.cheque_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err);
      res.status(500).send("Error al obtener las transacciones");
      return;
    }
    res.json(results.rows); // PostgreSQL devuelve los resultados en "rows"
  });
});

// Ruta para agregar una nueva transacción
router.post("/", authenticateToken, (req, res) => {
  const {
    fecha,
    nombre_cliente,
    cliente_id,
    tipo,
    monto,
    banco_id,
    cheque_id, // Este es el número del cheque que recibimos
  } = req.body;

  const formattedFecha = fecha
    ? new Date(fecha).toISOString()
    : new Date().toISOString();

  console.log("Datos recibidos en el POST:", {
    fecha,
    formattedFecha, // Mostramos la fecha que realmente se utilizará
    nombre_cliente,
    cliente_id,
    tipo,
    monto,
    banco_id,
    cheque_id,
  });

  let numero_cheque = cheque_id;
  // Función para manejar la inserción de la transacción
  function insertarTransaccion(cliente_id, nombre_cliente) {
    console.log("Insertando transacción con cliente_id:", cliente_id);

    // Si la transacción es un pago con cheque
    if (tipo === "pago_cheque" && cheque_id) {
      console.log(
        "Transacción es un pago con cheque, número cheque:",
        cheque_id
      );

      // Buscar si el cheque ya existe por su número
      const queryCheque = "SELECT cheque_id FROM cheques WHERE numero = $1";
      connection.query(queryCheque, [cheque_id], (err, result) => {
        if (err) {
          console.error("Error al buscar cheque:", err);
          return res.status(500).send("Error al buscar cheque");
        }

        if (result.rows.length > 0) {
          // El cheque ya existe, usamos su cheque_id
          id = result.rows[0].cheque_id;
          console.log("Cheque ya existe con cheque_id:", id);
          realizarInsercionTransaccion(id);
        } else {
          // El cheque no existe, lo creamos
          console.log(
            "Cheque no existe, creando nuevo cheque con número:",
            numero_cheque
          );
          const insertCheque =
            "INSERT INTO cheques (numero) VALUES ($1) RETURNING cheque_id";
          connection.query(insertCheque, [numero_cheque], (err, result) => {
            if (err) {
              console.error("Error al insertar cheque:", err);
              return res.status(500).send("Error al insertar cheque");
            }
            id = result.rows[0].cheque_id;
            console.log("Cheque creado con cheque_id:", id);
            realizarInsercionTransaccion(id);
          });
        }
      });
    } else {
      console.log("Transacción no es un pago con cheque.");
      realizarInsercionTransaccion(null);
    }

    // Función para realizar la inserción de la transacción
    function realizarInsercionTransaccion(cheque_id) {
      console.log(
        "Realizando inserción de transacción con cheque_id:",
        cheque_id
      );

      const query =
        "INSERT INTO transacciones (fecha, cliente_id, tipo, monto, banco_id, cheque_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING transaccion_id";

      connection.query(
        query,
        [formattedFecha, cliente_id || null, tipo, monto, banco_id, cheque_id],
        (err, result) => {
          if (err) {
            console.error("Error al insertar transacción:", err);
            return res.status(500).send("Error al insertar transacción");
          }

          console.log(
            "Transacción agregada con éxito, transaccion_id:",
            result.rows[0].transaccion_id
          );

          res.json({
            message: "Transacción agregada con éxito",
            transaccion_id: result.rows[0].transaccion_id,
            cliente_id: cliente_id,
            nombre_cliente: nombre_cliente,
            banco_id: banco_id,
            fecha: formattedFecha,
            tipo: tipo,
            monto: monto,
            cheque_id: cheque_id, // Incluimos cheque_id en la respuesta
          });
        }
      );
    }
  }

  // Lógica para verificar el cliente
  if (cliente_id) {
    console.log("Cliente ya existe con cliente_id:", cliente_id);

    // Consulta para obtener el nombre y apellido del cliente
    const queryNombreCliente =
      "SELECT nombre, apellido FROM clientes WHERE cliente_id = $1";
    connection.query(queryNombreCliente, [cliente_id], (err, result) => {
      if (err) {
        console.error("Error al obtener el nombre del cliente:", err);
        return res.status(500).send("Error al obtener el nombre del cliente");
      }

      if (result.rows.length > 0) {
        // Concatenamos nombre y apellido para pasarlo a insertarTransaccion
        const nombreCompleto = `${result.rows[0].nombre} ${
          result.rows[0].apellido || ""
        }`.trim();
        insertarTransaccion(cliente_id, nombreCompleto);
      } else {
        console.error("Cliente no encontrado.");
        res.status(404).send("Cliente no encontrado");
      }
    });
  } else if (!nombre_cliente || nombre_cliente.trim() === "") {
    console.log("No se proporcionó un cliente válido.");
    insertarTransaccion(null, null);
  } else {
    console.log(
      "Cliente no proporcionado, buscando o creando uno nuevo:",
      nombre_cliente
    );

    const clienteDividido = nombre_cliente.split(" ");
    let nombre = clienteDividido.slice(0, -1).join(" ");
    let apellido = clienteDividido.slice(-1).join(" ");

    if (clienteDividido.length === 1) {
      nombre = clienteDividido[0];
      apellido = null;
    }

    const queryCliente =
      "SELECT cliente_id FROM clientes WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)";
    connection.query(queryCliente, [nombre, apellido], (err, result) => {
      if (err) {
        console.error("Error en la consulta de cliente:", err);
        return res.status(500).send("Error en la consulta de cliente");
      }

      let cliente_id;

      if (result.rows.length > 0) {
        // Cliente ya existe
        cliente_id = result.rows[0].cliente_id;
        console.log("Cliente encontrado con cliente_id:", cliente_id);
        insertarTransaccion(cliente_id, nombre + " " + apellido);
      } else {
        // Cliente no existe, lo creamos
        console.log(
          "Cliente no existe, creando nuevo cliente:",
          nombre,
          apellido
        );
        const insertCliente =
          "INSERT INTO clientes (nombre, apellido) VALUES ($1, $2) RETURNING cliente_id";
        connection.query(insertCliente, [nombre, apellido], (err, result) => {
          if (err) {
            console.error("Error al insertar cliente:", err);
            return res.status(500).send("Error al insertar cliente");
          }
          cliente_id = result.rows[0].cliente_id;
          console.log("Cliente creado con cliente_id:", cliente_id);
          insertarTransaccion(cliente_id, nombre + " " + apellido);
        });
      }
    });
  }
});

router.put("/:transaccion_id", authenticateToken, (req, res) => {
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

  const getOriginalFechaQuery =
    "SELECT fecha FROM transacciones WHERE transaccion_id = $1";

  connection.query(getOriginalFechaQuery, [transaccion_id], (err, result) => {
    if (err) {
      console.error("Error al obtener la fecha original:", err);
      return res.status(500).send("Error al obtener la fecha original");
    }

    const originalFecha = result.rows[0].fecha;
    const formattedFecha = fecha
      ? new Date(fecha).toISOString()
      : originalFecha;

    // Lógica para manejar cliente
    function manejarCliente(callback) {
      if (cliente_id) {
        // Si se proporciona `cliente_id`, solo lo usamos directamente
        console.log("Cliente ya existe con cliente_id:", cliente_id);
        callback(cliente_id);
      } else if (!nombre_cliente || nombre_cliente.trim() === "") {
        // Si no hay cliente ni nombre de cliente, dejamos `cliente_id` como null
        console.log("No se proporcionó cliente válido, se usará null.");
        callback(null);
      } else {
        // Si se proporciona un nombre de cliente, verificamos si existe o lo creamos
        console.log("Buscando o creando cliente:", nombre_cliente);

        const clienteDividido = nombre_cliente.split(" ");
        let nombre = clienteDividido.slice(0, -1).join(" ");
        let apellido = clienteDividido.slice(-1).join(" ");

        if (clienteDividido.length === 1) {
          nombre = clienteDividido[0];
          apellido = null;
        }

        const queryCliente =
          "SELECT cliente_id FROM clientes WHERE nombre = $1 AND (apellido = $2 OR apellido IS NULL)";
        connection.query(queryCliente, [nombre, apellido], (err, result) => {
          if (err) {
            console.error("Error al buscar cliente:", err);
            return res.status(500).send("Error al buscar cliente");
          }

          if (result.rows.length > 0) {
            // Cliente ya existe
            const cliente_id = result.rows[0].cliente_id;
            console.log("Cliente encontrado con cliente_id:", cliente_id);
            callback(cliente_id);
          } else {
            // Cliente no existe, lo creamos
            console.log("Cliente no encontrado, creando nuevo cliente.");
            const insertCliente =
              "INSERT INTO clientes (nombre, apellido) VALUES ($1, $2) RETURNING cliente_id";
            connection.query(
              insertCliente,
              [nombre, apellido],
              (err, result) => {
                if (err) {
                  console.error("Error al crear cliente:", err);
                  return res.status(500).send("Error al crear cliente");
                }
                const nuevoClienteId = result.rows[0].cliente_id;
                console.log("Cliente creado con cliente_id:", nuevoClienteId);
                callback(nuevoClienteId);
              }
            );
          }
        });
      }
    }

    // Llamamos a manejarCliente para resolver el cliente antes de actualizar la transacción
    manejarCliente((resolvedClienteId) => {
      // Verificamos si la transacción es un pago con cheque y si el cheque_id existe
      if (tipo === "pago_cheque" && cheque_id) {
        const queryCheque =
          "SELECT cheque_id, numero FROM cheques WHERE cheque_id = $1";
        connection.query(queryCheque, [cheque_id], (err, result) => {
          if (err) {
            console.error("Error al buscar cheque:", err);
            return res.status(500).send("Error al buscar cheque");
          }

          if (result.rows.length > 0) {
            const cheque = result.rows[0];
            if (cheque.numero !== String(numero_cheque)) {
              const updateChequeQuery =
                "UPDATE cheques SET numero = $1 WHERE cheque_id = $2";
              connection.query(
                updateChequeQuery,
                [String(numero_cheque), cheque_id],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Error al actualizar el número del cheque:",
                      err
                    );
                    return res
                      .status(500)
                      .send("Error al actualizar el número del cheque");
                  }
                  console.log(
                    "Cheque actualizado con el nuevo número:",
                    numero_cheque
                  );
                  actualizarTransaccion(cheque_id, resolvedClienteId); // Actualizamos la transacción con el cheque actualizado
                }
              );
            } else {
              actualizarTransaccion(cheque_id, resolvedClienteId); // Si el número no cambió, actualizamos la transacción directamente
            }
          } else {
            const insertChequeQuery =
              "INSERT INTO cheques (numero) VALUES ($1) RETURNING cheque_id";
            connection.query(
              insertChequeQuery,
              [String(numero_cheque)],
              (err, result) => {
                if (err) {
                  console.error("Error al insertar cheque:", err);
                  return res.status(500).send("Error al insertar cheque");
                }
                const newChequeId = result.rows[0].cheque_id;
                console.log("Nuevo cheque creado con ID:", newChequeId);
                actualizarTransaccion(newChequeId, resolvedClienteId); // Actualizamos la transacción con el nuevo cheque creado
              }
            );
          }
        });
      } else {
        actualizarTransaccion(null, resolvedClienteId); // Si no es pago con cheque, continuamos sin cheque_id
      }
    });

    // Función para actualizar la transacción
    function actualizarTransaccion(cheque_id, resolvedClienteId) {
      const query =
        "UPDATE transacciones SET fecha = $1, cliente_id = $2, tipo = $3, monto = $4, banco_id = $5, cheque_id = $6 WHERE transaccion_id = $7";

      connection.query(
        query,
        [
          formattedFecha,
          resolvedClienteId || null,
          tipo,
          monto,
          banco_id,
          cheque_id,
          transaccion_id,
        ],
        (err, result) => {
          if (err) {
            console.error("Error al actualizar la transacción:", err);
            return res.status(500).send("Error al actualizar la transacción");
          }
          res.json({
            message: "Transacción actualizada con éxito",
            transaccion_id: transaccion_id,
            cliente_id: resolvedClienteId,
            nombre_cliente: nombre_cliente,
            banco_id: banco_id,
            fecha: formattedFecha,
            tipo: tipo,
            monto: monto,
            cheque_id: cheque_id,
          });
        }
      );
    }
  });
});

// Ruta para eliminar una transacción
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const query =
    "DELETE FROM transacciones WHERE transaccion_id = $1 RETURNING cheque_id";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar la transacción:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar la transacción" });
    }

    if (result.rowCount > 0) {
      const cheque_id = result.rows[0].cheque_id;

      if (cheque_id) {
        // Si la transacción tenía un cheque, lo eliminamos también
        const deleteCheque = "DELETE FROM cheques WHERE cheque_id = $1";
        connection.query(deleteCheque, [cheque_id], (err) => {
          if (err) {
            console.error("Error al eliminar el cheque:", err);
            return res
              .status(500)
              .json({ message: "Error al eliminar el cheque" });
          }

          res.json({ message: "Transacción y cheque eliminados con éxito" });
        });
      } else {
        res.json({ message: "Transacción eliminada con éxito" });
      }
    } else {
      res.status(404).json({ message: "Transacción no encontrada" });
    }
  });
});

module.exports = router;
