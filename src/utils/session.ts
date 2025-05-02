export const getSessionId = (): string => {
  if (typeof window === "undefined") {
    // Estamos en el servidor (build o SSR)
    return "";
  }

  let sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID(); // O usa uuid si preferís
    localStorage.setItem("session_id", sessionId);
  }

  return sessionId;
};
