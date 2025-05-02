require("dotenv").config(); // Cargar las variables de entorno
console.log("Conectando a la base de datos:", process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const transactionsRoutes = require("./routes/transactions");
const banksRoutes = require("./routes/banks");
const clientsRoutes = require("./routes/clients");
const chequesRoutes = require("./routes/cheques");
// const authRoutes = require("./routes/auth");
const demoResetRoutes = require("./routes/reset");
const limitarAccionesDemo = require("./middleware/limitarAccionesDemo");
const setSessionId = require("./middleware/setSessionId");
const cron = require("node-cron");
const db = require("./db");

cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando reset demo automático...");

  try {
    // Reutilizamos el código de tu reset-demo, pero sin router
    await db.query(`DELETE FROM transacciones WHERE session_id IS NOT NULL`);
    await db.query(`DELETE FROM cheques WHERE session_id IS NOT NULL`);
    await db.query(`DELETE FROM clientes WHERE session_id IS NOT NULL`);
    await db.query(`DELETE FROM bancos WHERE session_id IS NOT NULL`);
    await db.query(`DELETE FROM acciones_demo`);

    console.log("Reset automático exitoso.");
  } catch (err) {
    console.error("Error en el reset automático:", err);
  }
});

const app = express();
app.use(express.json()); // Para manejar JSON en las peticiones

// Configuración de CORS
const corsOptions = {
  origin: [
    "https://anotacionesbancariaselmensualdemo-production.up.railway.app",
    "https://anotaciones-bancarias-elmensual-demo.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rutas
app.use(setSessionId);
app.use("/transacciones", limitarAccionesDemo, transactionsRoutes);
app.use("/bancos", limitarAccionesDemo, banksRoutes);
app.use("/clientes", limitarAccionesDemo, clientsRoutes);
app.use("/cheques", limitarAccionesDemo, chequesRoutes);
// app.use("/auth", authRoutes);
app.use("/demo", demoResetRoutes);

// Aquí puedes agregar un log para confirmar que las rutas se han registrado
console.log("Rutas registradas: /transacciones, /bancos, /clientes");

// Ruta de prueba para asegurar que el servidor funciona
app.get("/test", (req, res) => {
  res.send("¡Test exitoso!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
