// pages/_app.tsx
import { AppProps } from "next/app";
import "../app/globals.css";
import Sidebar from "../app/components/Layout/Sidebar";
import "/dist/output.css";
import { Toaster } from "react-hot-toast";

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
      <Toaster position="top-right" />
      {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div
          style={{
            background: "linear-gradient(to right, #fbbf24, #facc15)",
            color: "#1f2937",
            padding: "10px 20px",
            fontSize: "0.95rem",
            fontWeight: 500,
            textAlign: "center",
            borderBottom: "2px solid #f59e0b",
          }}
        >
          🔒 Estás usando el modo DEMO. Tenés un límite de{" "}
          <strong>30 acciones por día</strong>. Los datos se restauran
          automáticamente.
        </div>
      )}
      <Component {...pageProps} />
    </Sidebar>
  );
}

export default MyApp;
