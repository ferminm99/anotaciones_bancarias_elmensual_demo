import { useEffect, useState } from "react";
import { getBanks, deleteBank, addBank } from "../../app/services/api";
import BankTable from "../../app/components/Banks/BankTable";
import AddBankButton from "../../app/components/Banks/AddBankButton";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import { Bank } from "../../app/types";
import EditBankButton from "../../app/components/Banks/EditBankButton";
import { updateBank } from "../../app/services/api"; // Importa la función que realiza la solicitud al backend

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [bankToEdit, setBankToEdit] = useState<Bank | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Para el término de búsqueda
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    getBanks()
      .then((response) => {
        const sortedBanks = response.data.sort((a: Bank, b: Bank) =>
          a.nombre.localeCompare(b.nombre)
        );
        setBanks(sortedBanks);
        setFilteredBanks(sortedBanks);
      })
      .catch((error) => console.error("Error al obtener los bancos:", error));
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddBank = (data: Omit<Bank, "banco_id">) => {
    const bancoExistente = banks.find(
      (bank) => bank.nombre.toLowerCase() === data.nombre.toLowerCase()
    );

    if (bancoExistente) {
      setMessage("Ya existe un banco con este nombre.");
      setMessageType("error");
      return;
    }

    addBank(data)
      .then((response) => {
        setBanks((prev) => [...prev, response.data]);
        setFilteredBanks((prev) => [...prev, response.data]);
        setMessage("Banco agregado con éxito");
        setMessageType("success");
      })
      .catch((error) => {
        const msg = error.response?.data?.error || "Error al agregar banco";
        setMessage(msg);
        setMessageType("error");
      });
  };

  const confirmDeleteBank = (id: number) => {
    setBankToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteBank = () => {
    if (bankToDelete !== null) {
      deleteBank(bankToDelete)
        .then(() => {
          const updatedBanks = banks.filter(
            (bank) => bank.banco_id !== bankToDelete
          );
          setBanks(updatedBanks);
          setFilteredBanks(updatedBanks);
          setOpenConfirmDialog(false);
          setMessage("Banco eliminado con éxito");
          setMessageType("success");
        })
        .catch((error) => {
          const msg = error.response?.data || "Error al eliminar el banco";
          setMessage(msg);
          setMessageType("error");
        });
    }
  };

  const handleEditBank = (bank: Bank) => {
    setBankToEdit(bank);
    setOpenEditDialog(true);
    console.log(openEditDialog);
  };

  const handleUpdateBank = (data: Bank) => {
    const bancoExistente = banks.find(
      (bank) =>
        bank.nombre.toLowerCase() === data.nombre.toLowerCase() &&
        bank.banco_id !== data.banco_id
    );

    if (bancoExistente) {
      setMessage("Ya existe otro banco con este nombre.");
      setMessageType("error");
      return;
    }

    updateBank(data.banco_id, data)
      .then(() => {
        setBankToEdit(null);
        setOpenEditDialog(false);

        // Refrescar bancos en UI
        setBanks((prev) =>
          prev.map((bnk) => (bnk.banco_id === data.banco_id ? data : bnk))
        );
        setFilteredBanks((prev) =>
          prev.map((bnk) => (bnk.banco_id === data.banco_id ? data : bnk))
        );
        setMessage("Banco actualizado con éxito");
        setMessageType("success");
      })
      .catch((error) => {
        const msg = error.response?.data || "Error al actualizar el banco";
        setMessage(msg);
        setMessageType("error");
      });
  };

  // Función para manejar la búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y normaliza el texto
    setSearchTerm(term);

    const filtered = banks.filter((bank) =>
      bank.nombre.toLowerCase().includes(term)
    );
    setFilteredBanks(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-3 rounded shadow-md text-white ${
            messageType === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {message}
        </div>
      )}{" "}
      {/* Ajustamos el ancho y centramos */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bancos</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nombre del banco..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded h-10 mt-3 w-64" // Ajustamos el tamaño del campo de búsqueda
          />
          <AddBankButton onSubmit={handleAddBank} />
        </div>
      </div>
      <BankTable
        banks={filteredBanks.length ? filteredBanks : banks}
        onEdit={handleEditBank}
        onDelete={confirmDeleteBank}
      />
      <ConfirmDialog
        open={openConfirmDialog}
        title="Confirmar Eliminación"
        description={`¿Estás seguro que deseas eliminar este banco?`}
        onConfirm={handleDeleteBank}
        onCancel={() => setOpenConfirmDialog(false)}
      />
      {bankToEdit && (
        <EditBankButton
          bankToEdit={bankToEdit}
          onSubmit={handleUpdateBank}
          onClose={() => setBankToEdit(null)}
        />
      )}
    </div>
  );
};

export default Banks;
