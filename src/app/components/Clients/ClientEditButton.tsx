import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Cliente } from "../../types"; // Asegúrate de que el tipo de Cliente esté definido
import { updateCliente } from "../../services/api"; // Asegúrate de tener esta función para actualizar los clientes

interface EditClientButtonProps {
  onSubmit: (data: Cliente) => void;
  clientToEdit: Cliente | null;
  onClose: () => void;
}

const ClientEditButton: React.FC<EditClientButtonProps> = ({
  onSubmit,
  clientToEdit,
  onClose,
}) => {
  const [client, setClient] = useState<Cliente | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setClient(clientToEdit); // Inicializa el cliente con los datos del cliente a editar
    }
  }, [clientToEdit]);

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setClient((prev) => (prev ? { ...prev, [name as string]: value } : prev));
  };

  const handleSubmit = () => {
    if (client) {
      updateCliente(client.cliente_id, client)
        .then(() => {
          onSubmit(client); // Llama a onSubmit con los datos actualizados
        })
        .catch((error) => {
          console.error("Error al actualizar el cliente:", error);
        });
    }
  };

  return (
    <Dialog open={Boolean(clientToEdit)} onClose={onClose}>
      <DialogTitle>Editar Cliente</DialogTitle>
      <DialogContent>
        {client && (
          <>
            <TextField
              label="Nombre"
              type="text"
              name="nombre"
              value={client.nombre}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Apellido"
              type="text"
              name="apellido"
              value={client.apellido}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Actualizar Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientEditButton;
