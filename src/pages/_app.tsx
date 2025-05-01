// pages/_app.tsx
import { AppProps } from "next/app";
import "../app/globals.css";
import Sidebar from "../app/components/Layout/Sidebar";
import { useRouter } from "next/router";
import "/dist/output.css";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

function MyApp({ Component, pageProps }: AppProps) {
  // const router = useRouter();
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   console.log("Token in localStorage:", token);

  //   if (router.pathname === "/login") {
  //     // No redirigir si estás en la página de login
  //     return;
  //   }

  //   if (token) {
  //     try {
  //       const decoded = jwt_decode(token);
  //       console.log(decoded); // verifica si el token es válido
  //       setIsAuthenticated(true); // Si el token es válido, establece autenticación en true
  //     } catch (error) {
  //       console.error("Token inválido", error);
  //       setIsAuthenticated(false);
  //       localStorage.removeItem("token"); // Elimina el token inválido
  //       router.push("/login");
  //     }
  //   } else {
  //     console.log("No token found, redirecting to login.");
  //     router.push("/login"); // Redirige al login si no hay token
  //   }
  // }, [router]);

  // // Si no está autenticado y no estamos en /login, no muestra nada
  // if (!isAuthenticated && router.pathname !== "/login") return null;

  return (
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
  );
}

export default MyApp;
