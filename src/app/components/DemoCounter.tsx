"use client";

import { useEffect, useState } from "react"; // ajustá el path si es necesario
import { getAccionesRestantes } from "../services/api";

const DemoCounter = () => {
  const [accionesRestantes, setAccionesRestantes] = useState<number | null>(
    null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    getAccionesRestantes()
      .then((res) => setAccionesRestantes(res.data.restantes))
      .catch(() => setError(true));
  }, []);

  if (error || accionesRestantes === null) return null;

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
