import { useEffect, useState } from "react";
import { getAccionesRestantes } from "@/app/services/api";

const useDemoCounter = () => {
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    getAccionesRestantes()
      .then((res) => setRestantes(res.data.restantes))
      .catch(() => setRestantes(null));
  }, []);

  const restarUno = () => {
    setRestantes((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
  };

  return { restantes, restarUno };
};

export default useDemoCounter;
