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
import { Bank } from "../../types"; // Asegúrate de que el tipo de Bank esté definido
import { formatNumber } from "../../../utils/formatNumber"; // Si tienes una función para formatear números

const BankTable: React.FC<{
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
}> = ({ banks, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} className="shadow-lg rounded-lg">
      <Table className="table-auto min-w-full divide-y divide-gray-200">
        <TableHead className="bg-gray-100">
          <TableRow>
            <TableCell>Nombre del Banco</TableCell>
            <TableCell>Saldo Total</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white divide-y divide-gray-200">
          {banks.map((bank) => (
            <TableRow key={bank.banco_id}>
              <TableCell>{bank.nombre}</TableCell>
              <TableCell>{formatNumber(bank.saldo_total)}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEdit(bank)}
                  aria-label="edit"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(bank.banco_id)}
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

export default BankTable;
