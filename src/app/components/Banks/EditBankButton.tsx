import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Bank } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface EditBankButtonProps {
  onSubmit: (data: Bank) => void;
  bankToEdit: Bank | null;
  onClose: () => void;
}

const EditBankButton: React.FC<EditBankButtonProps> = ({
  onSubmit,
  bankToEdit,
  onClose,
}) => {
  const [bank, setBank] = useState<Bank | null>(null);
  const [newSaldoTotal, setNewSaldoTotal] = useState<string>(""); // Cambiamos a string para manejar el formato en tiempo real
  const [confirmChange, setConfirmChange] = useState<boolean>(false);

  useEffect(() => {
    if (bankToEdit) {
      setBank(bankToEdit);
      setNewSaldoTotal(formatNumber(bankToEdit.saldo_total.toString())); // Inicializamos con el saldo formateado
    }
  }, [bankToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBank((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Permitimos solo números y una coma para los decimales
    value = value.replace(/[^0-9,]/g, "");

    // Dividimos en parte entera y decimal
    const [integerPart, decimalPart] = value.split(",");

    // Formateamos la parte entera con puntos de miles
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Agregamos la parte decimal, limitándola a dos dígitos
    if (decimalPart !== undefined) {
      formattedValue += `,${decimalPart.slice(0, 2)}`;
    }

    setNewSaldoTotal(formattedValue);
  };

  const handleSubmit = () => {
    if (bank) {
      // Convertimos el saldo a número antes de enviarlo
      const saldoNumerico = parseFloat(
        newSaldoTotal.replace(/\./g, "").replace(",", ".")
      );
      onSubmit({ ...bank, saldo_total: saldoNumerico });
    }
  };

  const handleConfirmChange = () => {
    if (bank) {
      const saldoNumerico = parseFloat(
        newSaldoTotal.replace(/\./g, "").replace(",", ".")
      );
      onSubmit({ ...bank, saldo_total: saldoNumerico });
    }
    setConfirmChange(false);
  };

  return (
    <>
      <Dialog open={Boolean(bankToEdit)} onClose={onClose}>
        <DialogTitle>Editar Banco</DialogTitle>
        <DialogContent>
          {bank && (
            <>
              <TextField
                label="Nombre del Banco"
                type="text"
                name="nombre"
                value={bank.nombre}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Saldo Total"
                type="text"
                value={newSaldoTotal} // Mostramos el saldo formateado en tiempo real
                onChange={handleSaldoChange}
                fullWidth
                margin="normal"
                inputProps={{ inputMode: "decimal", pattern: "[0-9,]*" }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Actualizar Banco
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para cambiar el saldo */}
      <Dialog open={confirmChange} onClose={() => setConfirmChange(false)}>
        <DialogTitle>Confirmar Cambio de Saldo</DialogTitle>
        <DialogContent>
          ¿Estás seguro que deseas cambiar el saldo total del banco?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmChange(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmChange}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditBankButton;
