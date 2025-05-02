"use client";

import useDemoCounter from "../hooks/useDemoCounter";
import { useEffect, useState } from "react";
import { getAccionesRestantes } from "../services/api";

const DemoCounter = () => {
  const accionesDesdeHeader = useDemoCounter();
  const [accionesRestantes, setAccionesRestantes] = useState<number | null>(
    null
  );

  useEffect(() => {
    getAccionesRestantes()
      .then((res) => setAccionesRestantes(res.data.restantes))
      .catch(() => setAccionesRestantes(null));
  }, []);

  // Actualizar cuando cambia el header
  useEffect(() => {
    if (accionesDesdeHeader !== null) {
      setAccionesRestantes(accionesDesdeHeader);
    }
  }, [accionesDesdeHeader]);

  if (accionesRestantes === null) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 text-white rounded shadow-lg text-sm
        ${accionesRestantes <= 5 ? "bg-red-600" : "bg-gray-800"}`}
    >
      Modo DEMO – Acciones restantes: {accionesRestantes}
    </div>
  );
};

export default DemoCounter;
