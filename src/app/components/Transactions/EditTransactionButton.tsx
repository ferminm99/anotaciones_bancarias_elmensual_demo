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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Bank, Cliente, Transaction } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface ApiResponse<T> {
  data: T;
}

interface EditTransactionButtonProps {
  onSubmit: (data: Transaction) => Promise<ApiResponse<Transaction>>;
  banks: Bank[];
  transactionToEdit: Transaction | null;
  onClose: () => void;
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
}

const EditTransactionButton: React.FC<EditTransactionButtonProps> = ({
  onSubmit,
  banks,
  transactionToEdit,
  clientes,
  setClientes,
  onClose,
}) => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clienteOption, setClienteOption] = useState<string>("existente");
  const [nuevoCliente, setNuevoCliente] = useState<string>("");
  const [numeroCheque, setNumeroCheque] = useState<string>("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [displayMonto, setDisplayMonto] = useState<string>("");

  useEffect(() => {
    if (transactionToEdit) {
      setTransaction({
        ...transactionToEdit,
        fecha: new Date(transactionToEdit.fecha).toISOString().slice(0, 10),
      });
      setDisplayMonto(formatNumber(transactionToEdit.monto ?? 0));

      const bank = banks.find(
        (bank) => bank.banco_id === transactionToEdit.banco_id
      );

      setSelectedBank(bank || null);

      const client = clientes.find(
        (client) => client.cliente_id === transactionToEdit.cliente_id
      );
      setSelectedClient(client || null);

      if (
        transactionToEdit.tipo === "pago_cheque" &&
        transactionToEdit.numero_cheque
      ) {
        setNumeroCheque(transactionToEdit.numero_cheque);
      }
    }
  }, [transactionToEdit, banks, clientes]);

  // Aquí se usa el `useEffect` solo para inicializar los valores cuando `transactionToEdit` cambie.
  // No volverá a sobrescribir los datos cada vez que el usuario interactúe con el formulario.

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setTransaction((prev) =>
      prev ? { ...prev, [name as string]: value } : prev
    );

    // Si el campo que cambió es "tipo", limpiamos el cliente y cheque si no es interdeposito, transferencia o pago_cheque
    if (name === "tipo") {
      if (
        !["interdeposito", "transferencia", "pago_cheque", "pago"].includes(
          value as string
        )
      ) {
        setSelectedClient(null);
        setNuevoCliente("");
        setNumeroCheque(""); // Limpiamos el número de cheque si no es "pago_cheque"
      }
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Permitimos solo números y coma para decimales
    value = value.replace(/[^0-9,]/g, "");

    const [integerPart, decimalPart] = value.split(",");
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (decimalPart !== undefined) {
      formattedValue += `,${decimalPart.slice(0, 2)}`;
    }

    setDisplayMonto(formattedValue);
  };

  const isFormValid = () => {
    // Verifica si transaction y monto están definidos
    const isMontoValid =
      transaction?.monto !== undefined &&
      transaction?.monto !== null &&
      transaction?.monto > 0;

    // Verifica si la fecha no está vacía
    const isFechaValid = transaction?.fecha?.trim() !== "";

    // El cliente solo es obligatorio para ciertos tipos de transacción
    const isClienteValid = [
      "transferencia",
      "interdeposito",
      "pago_cheque",
      "pago",
    ].includes(transaction?.tipo || "")
      ? clienteOption === "nuevo"
        ? nuevoCliente.trim() !== ""
        : selectedClient !== null
      : true; // Para otros tipos de transacción, no es obligatorio

    const isBancoValid = selectedBank !== null;

    // El número de cheque es obligatorio si el tipo es pago_cheque
    const isChequeValid =
      transaction?.tipo === "pago_cheque"
        ? String(numeroCheque).trim() !== ""
        : true;

    // Retorna true si todas las condiciones son válidas
    return (
      isMontoValid &&
      isFechaValid &&
      isClienteValid &&
      isBancoValid &&
      isChequeValid
    );
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (transaction) {
      const montoNumerico = parseFloat(
        displayMonto.replace(/\./g, "").replace(",", ".")
      );

      const dataToSubmit: Transaction = {
        transaccion_id: transaction.transaccion_id,
        fecha: transaction.fecha,
        cliente_id:
          clienteOption === "nuevo" ? null : selectedClient?.cliente_id || null,
        nombre_cliente:
          clienteOption === "nuevo"
            ? nuevoCliente
            : selectedClient?.nombre || "",
        tipo: transaction.tipo,
        monto: montoNumerico,
        banco_id: selectedBank?.banco_id || transaction.banco_id,
        nombre_banco: selectedBank?.nombre || "",
        cheque_id:
          transaction.tipo === "pago_cheque"
            ? transaction.cheque_id || null
            : null,
        numero_cheque:
          transaction.tipo === "pago_cheque"
            ? String(numeroCheque) || null
            : null,
      };

      onSubmit(dataToSubmit)
        .then((response) => {
          if (clienteOption === "nuevo" && response?.data?.cliente_id) {
            const nuevoClienteObj: Cliente = {
              cliente_id: response.data.cliente_id,
              nombre: nuevoCliente.split(" ")[0] || "SinNombre",
              apellido: nuevoCliente.split(" ").slice(1).join(" ") || "",
            };

            // Agrega el cliente al estado global `clientes`
            setClientes((prevClientes) => {
              const existe = prevClientes.some(
                (cliente) => cliente.cliente_id === nuevoClienteObj.cliente_id
              );
              return existe ? prevClientes : [...prevClientes, nuevoClienteObj];
            });
          }
          onClose();
        })
        .catch((error) => {
          console.error("Error al actualizar la transacción:", error);
          alert("Hubo un problema al actualizar la transacción.");
        });
    }
  };

  return (
    <Dialog open={Boolean(transactionToEdit)} onClose={onClose}>
      <DialogTitle>Editar Transacción</DialogTitle>
      <DialogContent>
        {transaction && (
          <>
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

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="tipo-transaccion-label" shrink>
                Tipo de Transacción
              </InputLabel>
              <Select
                labelId="tipo-transaccion-label"
                id="tipo-transaccion"
                name="tipo"
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

            <FormControl fullWidth margin="normal">
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={transaction.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                label="Monto"
                type="text"
                name="monto"
                value={displayMonto} // Usamos `displayMonto` para visualización
                onChange={handleMontoChange}
              />
            </FormControl>

            {/* Mostrar los campos de cliente solo si es transferencia, interdeposito o pago_cheque */}
            {["interdeposito", "transferencia", "pago_cheque", "pago"].includes(
              transaction.tipo
            ) && (
              <>
                <FormControl component="fieldset" margin="normal">
                  <RadioGroup
                    row
                    value={clienteOption}
                    onChange={(e) => setClienteOption(e.target.value)}
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
                      }
                      value={selectedClient}
                      onChange={(event, newValue) =>
                        setSelectedClient(newValue)
                      }
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
                      label="Nombre del nuevo cliente"
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
                  type="number"
                  value={numeroCheque}
                  onChange={(e) => setNumeroCheque(e.target.value)}
                />
              </FormControl>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          CANCELAR
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          ACTUALIZAR TRANSACCIÓN
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTransactionButton;
