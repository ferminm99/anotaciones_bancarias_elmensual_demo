require("dotenv").config(); // Cargar las variables de entorno
console.log("Conectando a la base de datos:", process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const transactionsRoutes = require("./routes/transactions");
const banksRoutes = require("./routes/banks");
const clientsRoutes = require("./routes/clients");
const chequesRoutes = require("./routes/cheques");
const authRoutes = require("./routes/auth");
const app = express();
app.use(express.json()); // Para manejar JSON en las peticiones

// Configuración de CORS
const corsOptions = {
  origin: [
    "https://anotaciones-bancarias-elmensual.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ], // Agrega localhost si estás probando en local
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Rutas
app.use("/transacciones", transactionsRoutes);
app.use("/bancos", banksRoutes);
app.use("/clientes", clientsRoutes);
app.use("/cheques", chequesRoutes);
app.use("/auth", authRoutes);

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
