import axios from "axios";
import { Transaction, CreateTransaction, Bank } from "../types";
import { getSessionId } from "../../utils/session";
// //Configura Axios con la baseURL
// const api = axios.create({
//   baseURL: "http://localhost:3001", // Solo la baseURL, sin especificar la ruta completa
// });

//Configura Axios con la baseURL

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

// Interceptor para agregar el session_id **solo en el navegador**
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const sessionId = getSessionId();
    config.headers["x-session-id"] = sessionId;
    return config;
  });
}

console.log("Usando API URL:", process.env.NEXT_PUBLIC_API_URL);

// Función para obtener transacciones desde el backend
export const getTransactions = () => {
  return api.get("/transacciones"); // Usa la baseURL y agrega la ruta relativa
};

// Función para agregar una nueva transacción
export const addTransaction = (data: CreateTransaction) => {
  return api.post("/transacciones", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para actualizar una transacción existente
export const updateTransaction = (id: number, data: Transaction) => {
  return api.put(`/transacciones/${id}`, data); // Usa la baseURL y agrega la ruta relativa con el ID
};

// Función para eliminar una transacción
export const deleteTransaction = (id: number) => {
  return api.delete(`/transacciones/${id}`);
};

// Función para obtener todos los bancos
export const getBanks = () => {
  return api.get("/bancos"); // Usa la baseURL y agrega la ruta relativa
};

// Función para agregar un nuevo banco
export const addBank = (data: { nombre: string; saldo_total: number }) => {
  return api.post("/bancos", data); // Usa la baseURL y agrega la ruta relativa
};

// Función para actualizar un banco existente
export const updateBank = (banco_id: number, data: Bank) => {
  return api.put(`/bancos/${banco_id}`, data); // Usa la baseURL y agrega la ruta relativa con el ID
};

// Función para eliminar un banco
export const deleteBank = (id: number) => {
  return api.delete(`/bancos/${id}`); // Usa la baseURL y agrega la ruta relativa
};

// Función para obtener todos los clientes
export const getClientes = () => {
  return api.get("/clientes"); // Usa la baseURL y agrega la ruta relativa
};

export const updateCliente = (
  cliente_id: number,
  data: { nombre: string; apellido: string }
) => {
  return api.put(`/clientes/${cliente_id}`, data); // Usa la baseURL y agrega la ruta relativa
};

export const addCliente = (data: { nombre: string; apellido: string }) => {
  return api.post("/clientes", data); // Usa la baseURL y agrega la ruta relativa
};

export const deleteCliente = (id: number) => {
  return api.delete(`/clientes/${id}`); // Usa la baseURL y agrega la ruta relativa
};

// Funciones para cheques
export const getCheques = () => {
  return api.get("/cheques"); // Usa la baseURL y agrega la ruta relativa
};

//autenticacion
export const login = async (
  username: string,
  password: string
): Promise<string> => {
  try {
    const response = await api.post("/auth/login", { username, password });
    console.log("Response from backend:", response.data); // Verifica la respuesta del backend
    return response.data.token; // Asegúrate de que `token` exista en la respuesta del backend
  } catch (error) {
    console.error("Error en la autenticación:", error);
    throw new Error("Error en la autenticación");
  }
};

export const getAccionesRestantes = () => {
  return api.get("/demo/acciones-restantes");
};

//Interceptor para proteger solicitudes
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Intercepta las respuestas del backend
// api.interceptors.response.use(
//   (response) => response, // Si la respuesta es exitosa, simplemente retórnala
//   (error) => {
//     // Si el token expiró o es inválido
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       console.error("Token inválido o expirado.");

//       // Opcional: Mostrar un mensaje al usuario
//       alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");

//       // Elimina el token y redirige al login
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }

//     // Propaga otros errores
//     return Promise.reject(error);
//   }
// );

// Valida si el token sigue siendo válido
export const validateToken = async (): Promise<boolean> => {
  try {
    await api.get("/auth/validate-token"); // Endpoint que solo verifica el token
    return true; // El token es válido
  } catch {
    return false; // El token no es válido
  }
};
