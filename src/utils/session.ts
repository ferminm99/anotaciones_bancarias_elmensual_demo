export const getSessionId = (): string => {
  let sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID(); // O usa uuid si querés
    localStorage.setItem("session_id", sessionId);
  }

  return sessionId;
};
