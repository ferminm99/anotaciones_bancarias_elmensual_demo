import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface AddBankButtonProps {
  onSubmit: (data: { nombre: string; saldo_total: number }) => void;
}

const AddBankButton: React.FC<AddBankButtonProps> = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState<string>("");
  const [saldoTotal, setSaldoTotal] = useState<string>("");

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setNombre("");
    setSaldoTotal("");
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

    setSaldoTotal(formattedValue);
  };

  const handleSubmit = () => {
    const saldoNumerico = parseFloat(
      saldoTotal.replace(/\./g, "").replace(",", ".")
    );
    if (!nombre || saldoNumerico <= 0) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    onSubmit({ nombre, saldo_total: saldoNumerico });
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Agregar Banco
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nuevo Banco</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Banco"
            type="text"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Saldo Inicial"
            type="text"
            fullWidth
            value={saldoTotal} // Mostramos el saldo formateado en tiempo real
            onChange={handleMontoChange}
            inputProps={{ inputMode: "decimal", pattern: "[0-9,]*" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddBankButton;
