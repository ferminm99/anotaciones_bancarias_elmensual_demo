const { v4: uuidv4 } = require("uuid");

const setSessionId = (req, res, next) => {
  let sessionId = req.headers["x-session-id"];

  if (!sessionId) {
    // Generar nuevo session_id
    sessionId = uuidv4();
    res.setHeader("x-session-id", sessionId);
  }

  res.locals.session_id = sessionId;
  next();
};

module.exports = setSessionId;
