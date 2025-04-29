import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Cliente } from "../../types";

const ClienteTable: React.FC<{
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}> = ({ clientes, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} className="shadow-lg rounded-lg">
      <Table className="table-auto min-w-full divide-y divide-gray-200">
        <TableHead className="bg-gray-100">
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white divide-y divide-gray-200">
          {clientes.map((cliente) => (
            <TableRow key={cliente.cliente_id}>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.apellido}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEdit(cliente)} // Llamada al handler de editar
                  aria-label="edit"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(cliente.cliente_id)}
                  aria-label="delete"
                  className="text-gray-500 hover:text-red-500"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClienteTable;
