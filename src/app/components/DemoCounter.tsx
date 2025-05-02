"use client";

import useDemoCounter from "@/app/hooks/useDemoCounter";

const DemoCounter = () => {
  const { restantes } = useDemoCounter();

  if (restantes === null) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 text-white rounded shadow-lg text-sm
        ${restantes <= 5 ? "bg-red-600" : "bg-gray-800"}`}
    >
      Modo DEMO – Acciones restantes: {restantes}
    </div>
  );
};

export default DemoCounter;
