"use client";

import { useEffect, useState } from "react";
import { getBanks, addBank, deleteBank, updateBank } from "@/app/services/api";
import { Bank } from "@/app/types";
import toast from "react-hot-toast";

import BankTable from "@/app/components/Banks/BankTable";
import AddBankButton from "@/app/components/Banks/AddBankButton";
import EditBankButton from "@/app/components/Banks/EditBankButton";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { restarUnoGlobal } from "@/app/hooks/useDemoCounter";

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const [bankToEdit, setBankToEdit] = useState<Bank | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getBanks()
      .then((res) => {
        const ordenados = res.data.sort((a: Bank, b: Bank) =>
          a.nombre.localeCompare(b.nombre)
        );
        setBanks(ordenados);
        setFilteredBanks(ordenados);
      })
      .catch((err) => console.error("Error al obtener bancos:", err));
  }, []);

  const handleAddBank = (data: Omit<Bank, "banco_id">) => {
    const exists = banks.find(
      (b) => b.nombre.toLowerCase() === data.nombre.toLowerCase()
    );
    if (exists) {
      toast.error("Ya existe un banco con este nombre.");
      return;
    }

    addBank(data)
      .then((res) => {
        setBanks((prev) => [...prev, res.data]);
        setFilteredBanks((prev) => [...prev, res.data]);
        restarUnoGlobal();
        toast.success("Banco agregado con éxito");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Error al agregar banco";
        toast.error(msg);
      });
  };

  const confirmDeleteBank = (id: number) => {
    setBankToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteBank = () => {
    if (!bankToDelete) return;

    deleteBank(bankToDelete)
      .then(() => {
        const updated = banks.filter((b) => b.banco_id !== bankToDelete);
        setBanks(updated);
        setFilteredBanks(updated);
        setOpenConfirmDialog(false);
        restarUnoGlobal();
        toast.success("Banco eliminado con éxito");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Error al eliminar banco";
        toast.error(msg);
      });
  };

  const handleEditBank = (bank: Bank) => {
    setBankToEdit(bank);
    setOpenEditDialog(true);
    console.log(openEditDialog);
  };

  const handleUpdateBank = (data: Bank) => {
    const conflict = banks.find(
      (b) =>
        b.nombre.toLowerCase() === data.nombre.toLowerCase() &&
        b.banco_id !== data.banco_id
    );

    if (conflict) {
      toast.error("Ya existe otro banco con ese nombre.");
      return;
    }

    updateBank(data.banco_id, data)
      .then(() => {
        const updated = banks.map((b) =>
          b.banco_id === data.banco_id ? data : b
        );
        setBanks(updated);
        setFilteredBanks(updated);
        restarUnoGlobal();
        toast.success("Banco actualizado con éxito");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Error al actualizar banco";
        toast.error(msg);
      });

    setBankToEdit(null);
    setOpenEditDialog(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredBanks(
      banks.filter((b) => b.nombre.toLowerCase().includes(term))
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bancos</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar banco..."
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded h-10 mt-3 w-64"
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
        description="¿Estás seguro que deseas eliminar este banco?"
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
