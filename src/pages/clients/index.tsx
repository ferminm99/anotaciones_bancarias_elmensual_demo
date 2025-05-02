import { useEffect, useState } from "react";
import { getClientes, deleteCliente, addCliente } from "../../app/services/api";
import ClienteTable from "../../app/components/Clients/ClientsTable";
import AddClienteButton from "../../app/components/Clients/ClientsButtonAdd";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import { Cliente } from "../../app/types";
import EditClientButton from "../../app/components/Clients/ClientEditButton";
import { toast } from "react-hot-toast";
import useDemoCounter from "@/app/hooks/useDemoCounter";

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Para el término de búsqueda

  useEffect(() => {
    getClientes()
      .then((response) => {
        setClientes(response.data);
        setFilteredClientes(response.data);
      })
      .catch((error) => console.error("Error al obtener los clientes:", error));
  }, []);

  const { restarUno } = useDemoCounter();
  const handleAddCliente = (data: Omit<Cliente, "cliente_id">) => {
    addCliente(data)
      .then((response) => {
        setClientes((prev) => [...prev, response.data]);
        setFilteredClientes((prev) => [...prev, response.data]);
        restarUno();
        toast.success("Cliente agregado con éxito");
      })
      .catch((error) => {
        const msg = error.response?.data?.error || "Error al agregar cliente";
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
          const updatedClientes = clientes.filter(
            (cliente) => cliente.cliente_id !== clienteToDelete
          );
          setClientes(updatedClientes);
          setFilteredClientes(updatedClientes);
          setOpenConfirmDialog(false);
          restarUno();
          toast.success("Cliente eliminado con éxito");
        })
        .catch((error) => {
          const msg =
            error.response?.data?.error || "Error al eliminar cliente";
          toast.error(msg);
        });
    }
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setOpenEditDialog(true);
    console.log(openEditDialog);
  };

  const handleUpdateCliente = (data: Cliente) => {
    setClientes((prevClientes) =>
      prevClientes.map((cli) =>
        cli.cliente_id === data.cliente_id ? data : cli
      )
    );

    setFilteredClientes((prevFiltered) =>
      prevFiltered.map((cli) =>
        cli.cliente_id === data.cliente_id ? data : cli
      )
    );
    restarUno();
    toast.success("Cliente actualizado con éxito");

    setClienteToEdit(null);
    setOpenEditDialog(false);
  };

  // Función para manejar la búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y normaliza el texto

    setSearchTerm(term);

    const searchTerms = term.split(" "); // Dividimos el término de búsqueda en palabras

    const filtered = clientes.filter((cliente) => {
      const fullName = `${cliente.nombre} ${cliente.apellido}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y normaliza

      // Verificamos si todas las palabras del término de búsqueda están en el nombre completo
      return searchTerms.every((word) => fullName.includes(word));
    });

    setFilteredClientes(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {" "}
      {/* Ajustamos el ancho y centramos */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded h-10 mt-3 w-64" // Cambia el ancho a w-64 o w-72
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
        description={`¿Estás seguro que deseas eliminar este cliente?`}
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
