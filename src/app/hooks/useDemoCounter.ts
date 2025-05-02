import { useEffect, useState } from "react";
import axios from "axios";

const useDemoCounter = () => {
  const [restantes, setRestantes] = useState<number | null>(null);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        const headerValue = response.headers["x-acciones-restantes"];
        if (headerValue !== undefined) {
          setRestantes(parseInt(headerValue, 10));
        }
        return response;
      },
      (error) => {
        // También lo chequeamos en errores 429
        const headerValue = error?.response?.headers?.["x-acciones-restantes"];
        if (headerValue !== undefined) {
          setRestantes(parseInt(headerValue, 10));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return restantes;
};

export default useDemoCounter;
