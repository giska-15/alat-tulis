require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const categories = require("./routes/categories");
const products = require("./routes/products");
const customers = require("./routes/customers");
const sales = require("./routes/sales");
const cashiers = require("./routes/cashiers");
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");

const app = express();

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "uas-web-backend", time: new Date().toISOString() });
});

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/customers", customers);
app.use("/api/sales", sales);
app.use("/api/cashiers", cashiers);

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { message: "Internal Server Error" } });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
