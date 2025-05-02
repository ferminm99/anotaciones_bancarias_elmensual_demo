import useDemoCounter from "../hooks/useDemoCounter";

const DemoCounter = () => {
  const restantes = useDemoCounter();

  if (restantes === null) return null; // No mostrar nada si no hay info

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-500 text-yellow-800 px-4 py-2 rounded shadow-md z-50">
      Acciones restantes (modo demo): <strong>{restantes}</strong>
    </div>
  );
};

export default DemoCounter;
