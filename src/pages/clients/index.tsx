import { useEffect, useState } from "react";
import {
  getClientes,
  deleteCliente,
  addCliente,
  updateCliente,
} from "../../app/services/api";
import ClienteTable from "../../app/components/Clients/ClientsTable";
import AddClienteButton from "../../app/components/Clients/ClientsButtonAdd";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import EditClientButton from "../../app/components/Clients/ClientEditButton";
import { Cliente } from "../../app/types";
import { toast } from "react-hot-toast";
import { restarUnoGlobal } from "@/app/hooks/useDemoCounter";

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getClientes()
      .then((res) => {
        setClientes(res.data);
        setFilteredClientes(res.data);
      })
      .catch((err) => console.error("Error al obtener clientes:", err));
  }, []);

  const handleAddCliente = (data: Omit<Cliente, "cliente_id">) => {
    addCliente(data)
      .then((res) => {
        setClientes((prev) => [...prev, res.data]);
        setFilteredClientes((prev) => [...prev, res.data]);
        restarUnoGlobal();
        toast.success("Cliente agregado");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Error al agregar";
        toast.error(msg);
      });
  };

  const confirmDeleteCliente = (id: number) => {
    setClienteToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteCliente = () => {
    if (clienteToDelete !== null) {
      deleteCliente(clienteToDelete)
        .then(() => {
          const updated = clientes.filter(
            (c) => c.cliente_id !== clienteToDelete
          );
          setClientes(updated);
          setFilteredClientes(updated);
          setOpenConfirmDialog(false);
          restarUnoGlobal();
          toast.success("Cliente eliminado");
        })
        .catch((err) => {
          const msg = err.response?.data?.error || "Error al eliminar";
          toast.error(msg);
        });
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setOpenEditDialog(true);
  };

  const handleUpdateCliente = (data: Cliente) => {
    updateCliente(data.cliente_id, {
      nombre: data.nombre,
      apellido: data.apellido,
    })
      .then(() => {
        const updated = clientes.map((c) =>
          c.cliente_id === data.cliente_id ? data : c
        );
        setClientes(updated);
        setFilteredClientes(updated);
        restarUnoGlobal();
        toast.success("Cliente actualizado");
        setOpenEditDialog(false);
        setClienteToEdit(null);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Error al actualizar";
        toast.error(msg);
      });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    setSearchTerm(term);

    const words = term.split(" ");
    const filtered = clientes.filter((c) => {
      const name = `${c.nombre} ${c.apellido}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return words.every((w) => name.includes(w));
    });

    setFilteredClientes(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar por nombre o apellido..."
            className="border p-2 rounded h-10 mt-3 w-64"
          />
          <AddClienteButton onSubmit={handleAddCliente} />
        </div>
      </div>
      <ClienteTable
        clientes={filteredClientes.length ? filteredClientes : clientes}
        onEdit={handleEditCliente}
        onDelete={confirmDeleteCliente}
      />
      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description="¿Estás seguro que deseas eliminar este cliente?"
        onConfirm={handleDeleteCliente}
        onCancel={() => setOpenConfirmDialog(false)}
      />
      {clienteToEdit && (
        <EditClientButton
          clientToEdit={clienteToEdit}
          onSubmit={handleUpdateCliente}
          onClose={() => setClienteToEdit(null)}
        />
      )}
    </div>
  );
};

export default Clientes;
