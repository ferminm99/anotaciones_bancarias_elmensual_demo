const { exec } = require("child_process");

// Ejecutar npm run dev en la carpeta del frontend
const frontend = exec("npm run dev", {
  cwd: "C:/GitRepositorios/anotaciones_elmensual",
});

frontend.stdout.on("data", (data) => {
  console.log(`Frontend: ${data}`);
});

frontend.stderr.on("data", (data) => {
  console.error(`Frontend Error: ${data}`);
});

frontend.on("close", (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

// Ejecutar node server.js en la carpeta del backend
const backend = exec("node server.js", {
  cwd: "C:/GitRepositorios/anotaciones_elmensual/backend",
});

backend.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

backend.stderr.on("data", (data) => {
  console.error(`Backend Error: ${data}`);
});

backend.on("close", (code) => {
  console.log(`Backend process exited with code ${code}`);
});
