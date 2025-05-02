import { useEffect, useState } from "react";
import { getAccionesRestantes } from "../services/api";

let setRestantesGlobal: React.Dispatch<
  React.SetStateAction<number | null>
> | null = null;

export const restarUnoGlobal = () => {
  if (setRestantesGlobal) {
    setRestantesGlobal((prev) =>
      prev !== null ? Math.max(0, prev - 1) : null
    );
  }
};

const useDemoCounter = () => {
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    getAccionesRestantes()
      .then((res) => setRestantes(res.data.restantes))
      .catch(() => setRestantes(null));

    setRestantesGlobal = setRestantes;

    return () => {
      setRestantesGlobal = null;
    };
  }, []);

  const restarUno = () => {
    setRestantes((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
  };

  return { restantes, restarUno };
};

export default useDemoCounter;
