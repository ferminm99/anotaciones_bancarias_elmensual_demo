import { useEffect, useState } from "react";
import api from "../services/api";

const useDemoCounter = () => {
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    // Al montar, pedimos las acciones restantes
    api
      .get("/demo/acciones-restantes")
      .then((res) => setRestantes(res.data.restantes))
      .catch(() => setRestantes(null));

    // Interceptor para actualizar en cada respuesta
    const interceptor = api.interceptors.response.use(
      (response) => {
        const header = response.headers["x-acciones-restantes"];
        if (header !== undefined) {
          setRestantes(parseInt(header, 10));
        }
        return response;
      },
      (error) => {
        const header = error?.response?.headers?.["x-acciones-restantes"];
        if (header !== undefined) {
          setRestantes(parseInt(header, 10));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return restantes;
};

export default useDemoCounter;
