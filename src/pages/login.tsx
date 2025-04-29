import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { login } from "@/app/services/api"; // Importa la función login que hicimos en api.ts
import { useRouter } from "next/router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Resetear mensaje de error antes de intentar loguearse

    try {
      const token = await login(username, password);
      console.log("Token received:", token); // Verifica que el token se recibe
      localStorage.setItem("token", token); // Guarda el token en localStorage
      console.log("Token saved to localStorage"); // Log para confirmar que se guarda
      router.push("/"); // Redirige a la página principal después del login
    } catch (error) {
      setErrorMessage("Usuario o contraseña incorrectos");
      console.error("Error en el login:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5">Login</Typography>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <Button type="submit" variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
};

export default Login;
