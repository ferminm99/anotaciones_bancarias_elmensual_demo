import { useEffect, useState } from "react";
import api from "../services/api"; // ⚠️ importá tu instancia

const useDemoCounter = () => {
  const [accionesRestantes, setAccionesRestantes] = useState<number | null>(
    null
  );

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => {
        const restantes = response.headers["x-acciones-restantes"];
        if (restantes !== undefined) {
          setAccionesRestantes(parseInt(restantes, 10));
        }
        return response;
      },
      (error) => {
        const restantes = error.response?.headers?.["x-acciones-restantes"];
        if (restantes !== undefined) {
          setAccionesRestantes(parseInt(restantes, 10));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return accionesRestantes;
};

export default useDemoCounter;
