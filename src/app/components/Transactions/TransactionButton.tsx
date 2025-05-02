import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Bank, Cliente, Transaction, CreateTransaction } from "../../types";

interface ApiResponse<T> {
  data: T;
}

interface TransactionButtonProps {
  onSubmit: (data: CreateTransaction) => Promise<ApiResponse<Transaction>>;
  banks: Bank[];
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  selectedBank?: Bank;
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  onSubmit,
  banks,
  clientes,
  setClientes,
  selectedBank: initialSelectedBank, // Recibe el banco seleccionado desde las props
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(
    initialSelectedBank || null
  );
  const [nuevoCliente, setNuevoCliente] = useState<string>("");
  const [clienteOption, setClienteOption] = useState<string>("existente");
  const [numeroCheque, setNumeroCheque] = useState<string>(""); // Nuevo estado para número de cheque
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Meses empiezan en 0
  const day = String(today.getDate()).padStart(2, "0");
  const localToday = `${year}-${month}-${day}`;

  const [transaction, setTransaction] = useState<CreateTransaction>({
    cliente_id: null,
    banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0, // Inicializa con el ID del banco seleccionado
    fecha: localToday,
    monto: null,
    tipo: "",
    numero_cheque: null, // Añadimos cheque_id inicializado en null
  });
  const [displayMonto, setDisplayMonto] = useState<string>(""); // Para visualización

  useEffect(() => {
    setSelectedBank(initialSelectedBank || null);
    setTransaction((prev) => ({
      ...prev,
      banco_id: initialSelectedBank ? initialSelectedBank.banco_id : 0,
    }));
  }, [initialSelectedBank]);

  useEffect(() => {
    // Actualiza la lista local de clientes al cambiar el estado global
    setClientes(clientes);
    console.log("Clientes actualizados en TransactionButton:", clientes);
  }, [clientes]);

  const isFormValid = () => {
    const montoNumerico = parseFloat(
      displayMonto.replace(/\./g, "").replace(",", ".")
    );
    const isMontoValid = montoNumerico !== null && montoNumerico > 0;
    const isFechaValid = transaction.fecha.trim() !== "";
    console.log(isMontoValid);
    // El cliente solo es obligatorio para transferencia, interdeposito y pago_cheque
    const isClienteValid = [
      "transferencia",
      "interdeposito",
      "pago_cheque",
      "pago",
    ].includes(transaction.tipo)
      ? clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedCliente !== null
      : true; // Para otros tipos de transacción, no es obligatorio

    const isBancoValid = selectedBank !== null;

    // El número de cheque es obligatorio si el tipo es pago_cheque
    const isChequeValid =
      transaction.tipo === "pago_cheque" ? numeroCheque.trim() !== "" : true;

    return (
      isMontoValid &&
      isFechaValid &&
      isClienteValid &&
      isBancoValid &&
      isChequeValid
    );
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Solo permitimos números y coma
    value = value.replace(/[^0-9,]/g, "");

    // Dividimos en parte entera y parte decimal
    const [integerPart, decimalPart] = value.split(",");

    // Formateamos la parte entera con puntos
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Agregamos la parte decimal, limitándola a dos dígitos si existe
    if (decimalPart !== undefined) {
      formattedValue += `,${decimalPart.slice(0, 2)}`; // Limita a dos dígitos después de la coma
    }

    // Actualizamos el estado solo para visualización
    setDisplayMonto(formattedValue);
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;

    // Actualizar el tipo de transacción
    setTransaction((prev) => ({ ...prev, [name as string]: value }));

    // Si el campo que cambió es "tipo", limpiamos el cliente si no es "interdeposito", "transferencia" o "pago_cheque"
    if (name === "tipo") {
      if (
        !["interdeposito", "transferencia", "pago_cheque", "pago"].includes(
          value as string
        )
      ) {
        setSelectedCliente(null);
        setNuevoCliente("");
      }
    }
  };

  const resetForm = () => {
    setTransaction({
      cliente_id: null,
      banco_id: transaction.banco_id, // Mantener el banco seleccionado
      fecha: localToday,
      monto: null,
      tipo: "", // Reiniciar tipo de transacción
      numero_cheque: null, // Reiniciamos cheque_id a null
    });
    setDisplayMonto("");
    setSelectedCliente(null); // Reiniciar cliente seleccionado
    setNuevoCliente(""); // Reiniciar nuevo cliente
    setNumeroCheque(""); // Reiniciar número de cheque
    setClienteOption("existente"); // Volver a la opción de cliente existente por defecto
    setSelectedBank(initialSelectedBank || null); // Reiniciar banco seleccionado
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    const montoNumerico = parseFloat(
      displayMonto.replace(/\./g, "").replace(",", ".")
    );

    const dataToSubmit: CreateTransaction = {
      fecha: transaction.fecha,
      cliente_id:
        clienteOption === "nuevo" ? null : selectedCliente?.cliente_id || null,
      tipo: transaction.tipo,
      monto: montoNumerico,
      banco_id: selectedBank?.banco_id || transaction.banco_id,
      numero_cheque:
        transaction.tipo === "pago_cheque" ? numeroCheque || null : null,
    };

    onSubmit(dataToSubmit)
      .then((response) => {
        if (clienteOption === "nuevo" && response?.data?.cliente_id) {
          const nuevoClienteObj: Cliente = {
            cliente_id: response.data.cliente_id,
            nombre: nuevoCliente.split(" ")[0] || "SinNombre",
            apellido: nuevoCliente.split(" ").slice(1).join(" ") || "",
          };

          // Verifica si el cliente ya existe
          setClientes((prevClientes) => {
            const existe = prevClientes.some(
              (cliente) => cliente.cliente_id === nuevoClienteObj.cliente_id
            );
            return existe ? prevClientes : [...prevClientes, nuevoClienteObj];
          });
        }
        handleClose();
      })
      .catch((error) => {
        console.error("Error al actualizar la transacción:", error);
        alert("Hubo un problema al actualizar la transacción.");
      });
  };

  const handleClienteOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setClienteOption(e.target.value);
    setSelectedCliente(null);
    setNuevoCliente("");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    resetForm(); // Reiniciar el formulario después del envío
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        AGREGAR TRANSACCIÓN
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nueva Transacción</DialogTitle>
        <DialogContent>
          {/* Autocomplete de Banco */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="banco-label" shrink>
              Banco
            </InputLabel>
            <Select
              labelId="banco-label"
              id="banco"
              name="banco_id"
              value={selectedBank?.banco_id || ""}
              disabled // Esto hace que el campo sea solo visible pero no editable
            >
              {banks.map((bank) => (
                <MenuItem key={bank.banco_id} value={bank.banco_id}>
                  {bank.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Tipo de Transacción */}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="tipo-transaccion-label" shrink>
              Tipo de Transacción
            </InputLabel>
            <Select
              labelId="tipo-transaccion-label"
              id="tipo-transaccion"
              name="tipo" // Asegúrate de que el atributo `name` está aquí
              value={transaction.tipo}
              onChange={(e) =>
                handleChange(
                  e as React.ChangeEvent<{ name?: string; value: unknown }>
                )
              }
              label="Tipo de Transacción"
            >
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="interdeposito">Interdepósito</MenuItem>
              <MenuItem value="gastos_mantenimiento">
                Gastos de Mantenimiento
              </MenuItem>
              <MenuItem value="impuesto">Impuesto</MenuItem>
              <MenuItem value="cheque_deposito">Deposito de Cheque</MenuItem>
              <MenuItem value="retiro_cheque">Retiro de Cheque</MenuItem>
              <MenuItem value="deposito_efectivo">
                Depósito en Efectivo
              </MenuItem>
              <MenuItem value="retiro_efectivo">Retiro en Efectivo</MenuItem>
              <MenuItem value="pago_cheque">Pago con Cheque</MenuItem>
              <MenuItem value="pago">Servicio de Pago</MenuItem>
            </Select>
          </FormControl>

          {/* Fecha */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={transaction.fecha}
              onChange={handleChange}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </FormControl>

          {/* Cliente existente o nuevo */}
          {/* Solo muestra el campo de cliente si es interdeposito, transferencia o pago_cheque */}
          {["interdeposito", "transferencia", "pago_cheque", "pago"].includes(
            transaction.tipo
          ) && (
            <>
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Cliente</FormLabel>
                <RadioGroup
                  row
                  value={clienteOption}
                  onChange={handleClienteOptionChange}
                >
                  <FormControlLabel
                    value="existente"
                    control={<Radio />}
                    label="Cliente existente"
                  />
                  <FormControlLabel
                    value="nuevo"
                    control={<Radio />}
                    label="Cliente nuevo"
                  />
                </RadioGroup>
              </FormControl>

              {clienteOption === "existente" && (
                <FormControl fullWidth margin="normal">
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) =>
                      `${option.nombre}${
                        option.apellido ? ` ${option.apellido}` : ""
                      }`
                    } // Combina nombre y apellido
                    value={selectedCliente}
                    onChange={(event, newValue) => setSelectedCliente(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Nombre y apellido"
                        placeholder="Seleccionar cliente existente"
                      />
                    )}
                  />
                </FormControl>
              )}

              {clienteOption === "nuevo" && (
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Nombre y apellido del nuevo cliente"
                    value={nuevoCliente}
                    onChange={(e) => setNuevoCliente(e.target.value)}
                  />
                </FormControl>
              )}
            </>
          )}

          {/* Campo para el número de cheque si el tipo es pago_cheque */}
          {transaction.tipo === "pago_cheque" && (
            <FormControl fullWidth margin="normal">
              <TextField
                label="Número de Cheque"
                value={numeroCheque}
                onChange={(e) => setNumeroCheque(e.target.value)}
              />
            </FormControl>
          )}

          {/* Monto */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Monto"
              type="text"
              name="monto"
              value={displayMonto} // Mostramos solo el valor de visualización
              onChange={handleMontoChange}
              inputProps={{ inputMode: "decimal", pattern: "[0-9,]*" }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            CANCELAR
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            AGREGAR TRANSACCIÓN
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionButton;
