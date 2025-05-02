"use client";

import useDemoCounter from "@/app/hooks/useDemoCounter";

const DemoCounter = () => {
  const accionesRestantes = useDemoCounter();

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
