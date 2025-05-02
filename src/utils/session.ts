let sessionId = localStorage.getItem("session_id");

if (!sessionId) {
  sessionId = crypto.randomUUID(); // o usa uuid si querés
  localStorage.setItem("session_id", sessionId);
}

export const getSessionId = () => sessionId!;
