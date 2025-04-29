// src/components/AddClienteButton.tsx
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface AddClienteButtonProps {
  onSubmit: (data: { nombre: string; apellido: string }) => void;
}

const AddClienteButton: React.FC<AddClienteButtonProps> = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNombre("");
    setApellido("");
  };

  const handleSubmit = () => {
    if (!nombre || !apellido) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Enviar los datos del nuevo cliente
    onSubmit({ nombre, apellido });
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Agregar Cliente
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Apellido"
            type="text"
            fullWidth
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
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

export default AddClienteButton;
