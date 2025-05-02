"use client";

import { useEffect, useState } from "react";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  getBanks,
  updateTransaction,
  getClientes,
} from "../app/services/api";
import TransactionTable from "../app/components/Transactions/TransactionTable";
import FilterByBank from "../app/components/Transactions/FilterByBank";
import AddTransactionButton from "../app/components/Transactions/TransactionButton";
import ConfirmDialog from "../app/components/ConfirmDialog";
import EditTransactionButton from "../app/components/Transactions/EditTransactionButton"; // Importamos el nuevo botón
import { Transaction, Bank, CreateTransaction, Cliente } from "../app/types";
import { Pagination } from "@mui/material";
import toast from "react-hot-toast";
import { restarUnoGlobal } from "@/app/hooks/useDemoCounter";

const Home: React.FC = () => {
  interface ApiResponse<T> {
    data: T;
  }

  // const [sessionExpired, setSessionExpired] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null); // Cambiado de [] a null
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false); // Controlamos la apertura del diálogo de edición
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 10;

  const fetchBanks = () => {
    getBanks()
      .then((response) => {
        const bancos = response.data;
        setBanks(bancos);
        const saldoTotal = bancos.reduce(
          (acc: number, bank: Bank) => acc + bank.saldo_total,
          0
        );
        setTotalSaldo(saldoTotal);
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  };

  useEffect(() => {
    // const verifySession = async () => {
    //   const isValid = await validateToken();
    //   if (!isValid && !sessionExpired) {
    //     setSessionExpired(true); // Marca la sesión como expirada
    //     //alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
    //     localStorage.removeItem("token");
    //     window.location.href = "/login";
    //   }
    // };

    //   // verifySession();

    //   // Carga los bancos y transacciones si el token es válido
    //   if (!sessionExpired) {
    getBanks()
      .then((response) => {
        const bancos: Bank[] = response.data;
        setBanks(bancos);

        const saldoTotal = bancos.reduce(
          (acc: number, bank: Bank) => acc + bank.saldo_total,
          0
        );
        setTotalSaldo(saldoTotal);

        const savedBank = localStorage.getItem("selectedBank");
        const firstBank: Bank = savedBank ? JSON.parse(savedBank) : bancos[0];

        if (firstBank) {
          setSelectedBank(firstBank);

          getTransactions()
            .then((response) => {
              const orderedTransactions = response.data.sort(
                (a: Transaction, b: Transaction) => {
                  const dateComparison =
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                  if (dateComparison === 0) {
                    return b.transaccion_id - a.transaccion_id;
                  }
                  return dateComparison;
                }
              );

              setTransactions(orderedTransactions);

              const filtered = orderedTransactions.filter(
                (transaction: Transaction) =>
                  transaction.banco_id === firstBank.banco_id
              );

              setFilteredTransactions(filtered);
            })
            .catch((error) =>
              console.error("Error al obtener las transacciones:", error)
            );
        }
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
    //   }
  }, []);

  useEffect(() => {
    getClientes()
      .then((response) => {
        // Elimina duplicados por `cliente_id`
        const clientesUnicos = response.data.reduce(
          (acc: Cliente[], cliente: Cliente) => {
            if (!acc.some((c) => c.cliente_id === cliente.cliente_id)) {
              acc.push(cliente);
            }
            return acc;
          },
          [] as Cliente[] // Tipo inicial del acumulador
        );
        setClientes(clientesUnicos);
      })
      .catch((error) => console.error("Error al cargar los clientes:", error));
  }, []);

  const handleAddTransaction = (data: CreateTransaction) => {
    return addTransaction({
      ...data,
      fecha: new Date(data.fecha).toISOString(),
    })
      .then((response) => {
        const bancoEncontrado = banks.find(
          (banco) => banco.banco_id === response.data.banco_id
        );

        console.log("ADD TRANSACTION:");
        console.log(response.data);
        const newTransaction: Transaction = {
          ...response.data,
          nombre_cliente: response.data.nombre_cliente || "",
          nombre_banco: bancoEncontrado ? bancoEncontrado.nombre : "SIN BANCO",
          numero_cheque: response.data.numero_cheque || null,
          cheque_id: response.data.cheque_id || null,
        };

        setTransactions((prev) => [newTransaction, ...prev]);

        // Solo agregamos a filteredTransactions si matchea con el banco seleccionado
        if (selectedBank && newTransaction.banco_id === selectedBank.banco_id) {
          setFilteredTransactions((prev) => [newTransaction, ...prev]);
        }

        // Cliente nuevo, lo agregamos
        if (data.cliente_id === null && response.data.cliente_id) {
          const nuevoCliente: Cliente = {
            cliente_id: response.data.cliente_id,
            nombre: response.data.nombre_cliente?.split(" ")[0] || "SinNombre",
            apellido:
              response.data.nombre_cliente?.split(" ").slice(1).join(" ") || "",
          };
          setClientes((prev) => [...prev, nuevoCliente]);
        }

        fetchBanks(); // esto si lo dejamos porque cambia el saldo
        restarUnoGlobal(); // contador
        toast.success("Transacción agregada con éxito");
        return response.data;
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.error || "Error al agregar la transacción"
        );
        throw error;
      });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    console.log(transaction);
    setTransactionToEdit(transaction); // Establecemos la transacción a editar
    setOpenEditDialog(true); // Abrimos el diálogo
    console.log(openEditDialog);
  };

  const handleUpdateTransaction = async (
    data: Transaction
  ): Promise<ApiResponse<Transaction>> => {
    return updateTransaction(data.transaccion_id, data)
      .then((response) => {
        const updated = {
          ...response.data,
          nombre_cliente: response.data.nombre_cliente || "",
          nombre_banco:
            banks.find((b) => b.banco_id === response.data.banco_id)?.nombre ||
            "SIN BANCO",
        };

        setTransactions((prev) =>
          prev.map((tx) =>
            tx.transaccion_id === data.transaccion_id ? updated : tx
          )
        );

        setFilteredTransactions((prev) =>
          prev.map((tx) =>
            tx.transaccion_id === data.transaccion_id ? updated : tx
          )
        );

        if (response.data.cliente_id) {
          const nuevoCliente: Cliente = {
            cliente_id: response.data.cliente_id,
            nombre: response.data.nombre_cliente?.split(" ")[0] || "SinNombre",
            apellido:
              response.data.nombre_cliente?.split(" ").slice(1).join(" ") || "",
          };

          setClientes((prev) =>
            prev.some((c) => c.cliente_id === nuevoCliente.cliente_id)
              ? prev
              : [...prev, nuevoCliente]
          );
        }

        fetchBanks(); // saldo cambió
        restarUnoGlobal();
        toast.success("Transacción actualizada con éxito");
        return updated;
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.error || "Error al actualizar la transacción"
        );
        throw error;
      });
  };

  const filterByBank = (banco: Bank | null) => {
    setSelectedBank(banco);

    // Reseteamos la página actual a la primera
    setCurrentPage(1);

    // Guarda el banco seleccionado en localStorage
    if (banco) {
      localStorage.setItem("selectedBank", JSON.stringify(banco));
    } else {
      localStorage.removeItem("selectedBank");
    }

    // Si banco es null, mostrar todas las transacciones
    if (!banco) {
      setFilteredTransactions(transactions);
      return;
    }

    // Filtrar transacciones por banco seleccionado
    const filtered = transactions.filter(
      (transaction) => transaction.banco_id === banco.banco_id
    );

    setFilteredTransactions(filtered);
  };

  const confirmDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteTransaction = () => {
    if (transactionToDelete !== null) {
      deleteTransaction(transactionToDelete)
        .then(() => {
          const updatedTransactions = transactions.filter(
            (transaction) => transaction.transaccion_id !== transactionToDelete
          );
          setTransactions(updatedTransactions);

          // Reaplica el filtro para mantener las transacciones del banco seleccionado
          const filtered = updatedTransactions.filter(
            (transaction) => transaction.banco_id === selectedBank?.banco_id
          );
          setFilteredTransactions(filtered);

          setOpenConfirmDialog(false);
          fetchBanks(); // Actualiza los bancos
          restarUnoGlobal();
          toast.success("Transacción eliminada con éxito");
        })
        .catch((error) => {
          console.error("Error al eliminar la transacción:", error);
          toast.error(
            error.response?.data?.error ||
              error.response?.data ||
              "Error al eliminar"
          );
        });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Normaliza y elimina los acentos

    setSearchTerm(term);

    // Filtra las transacciones basadas en el banco seleccionado
    const filtered = transactions.filter((transaction) => {
      // Solo consideramos las transacciones del banco seleccionado
      if (selectedBank && transaction.banco_id !== selectedBank.banco_id) {
        return false; // Si no coincide con el banco seleccionado, no la incluimos
      }

      const nombreCliente = transaction.nombre_cliente
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Normaliza y elimina los acentos

      const tipo = transaction.tipo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const nombreBanco = transaction.nombre_banco
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const monto =
        transaction.monto !== null ? transaction.monto.toString() : "0";

      // Verifica si alguno de los campos contiene el término de búsqueda
      return (
        nombreCliente?.includes(term) ||
        tipo.includes(term) ||
        nombreBanco.includes(term) ||
        monto.includes(term)
      );
    });

    setFilteredTransactions(filtered);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Dentro de tu return principal
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Transacciones</h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        {/* Filtro por banco */}
        <FilterByBank
          banks={banks.map(({ nombre, saldo_total, banco_id }) => ({
            nombre,
            saldo_total,
            banco_id,
          }))}
          selectedBank={selectedBank} // Pasamos el banco seleccionado
          onFilter={(banco) =>
            filterByBank(
              banco ?? { nombre: "Desconocido", saldo_total: 0, banco_id: 0 }
            )
          }
          totalSaldo={totalSaldo}
        />

        <div className="flex space-x-4">
          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Buscar..."
            className="border p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          {/* Botón de agregar transacción */}
          <AddTransactionButton
            onSubmit={handleAddTransaction}
            banks={banks}
            clientes={clientes} // Estado global actualizado
            setClientes={setClientes} // Para actualizar desde el hijo
            selectedBank={selectedBank ?? undefined}
          />
        </div>
      </div>

      <TransactionTable
        transactions={currentTransactions}
        onEdit={handleEditTransaction}
        onDelete={confirmDeleteTransaction}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          count={Math.ceil(filteredTransactions.length / transactionsPerPage)}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          color="primary"
        />
      </div>

      {/* Manejamos el diálogo de edición */}
      {transactionToEdit && (
        <EditTransactionButton
          transactionToEdit={transactionToEdit}
          banks={banks}
          onSubmit={handleUpdateTransaction}
          clientes={clientes}
          setClientes={setClientes}
          onClose={() => setTransactionToEdit(null)}
        />
      )}

      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description={`¿Estás seguro que deseas eliminar esta transacción?`}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setOpenConfirmDialog(false)}
      />
    </div>
  );
};

export default Home;
