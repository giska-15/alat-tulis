function toInt(value, fallback = undefined) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function toFloat(value, fallback = undefined) {
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

function sendError(res, status, message, details) {
  return res.status(status).json({
    error: {
      message,
      details: details ?? undefined,
    },
  });
}

module.exports = {
  toInt,
  toFloat,
  sendError,
};
