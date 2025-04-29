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
import { Transaction } from "../../types";
import { formatNumber } from "../../../utils/formatNumber";

// Mapa de clases Tailwind para los diferentes tipos de transacción
const tipoColorMap: { [key: string]: string } = {
  cheque_deposito: "#2c7a7b", // Verde oscuro
  deposito_efectivo: "#2c7a7b", // Verde oscuro
  interdeposito: "#2c7a7b", // Verde oscuro
  transferencia: "#c53030", // Rojo oscuro
  retiro_cheque: "#2b6cb0", // Azul oscuro
  pago_cheque: "#c53030", // Rojo oscuro
  impuesto: "#c53030", // Rojo oscuro
  gastos_mantenimiento: "#c53030", // Rojo oscuro
  retiro_efectivo: "#c53030", // Rojo oscuro
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Ajustamos la fecha para ignorar el desplazamiento de zona horaria
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses van de 0 a 11
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
};

const TransactionTable: React.FC<{
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}> = ({ transactions, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} className="shadow-lg rounded-lg">
      <Table className="table-auto min-w-full divide-y divide-gray-200">
        <TableHead className="bg-gray-100">
          <TableRow>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </TableCell>
            <TableCell className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <TableRow key={transaction.transaccion_id}>
              <TableCell>{formatDate(transaction.fecha)}</TableCell>

              <TableCell
                sx={{
                  color:
                    tipoColorMap[transaction.tipo.trim().toLowerCase()] ||
                    "gray",
                  fontWeight: "bold",
                }}
              >
                {transaction.tipo}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {transaction.nombre_cliente
                  ? transaction.nombre_cliente.replace("null", "")
                  : " - "}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {transaction.monto !== null
                  ? formatNumber(transaction.monto)
                  : "-"}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <IconButton
                  onClick={() => onEdit(transaction)}
                  aria-label="edit"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(transaction.transaccion_id)}
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

export default TransactionTable;
