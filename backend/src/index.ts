import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import offerRoutes from "./routes/offer.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = Number(process.env.PORT || 4000);

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173").split(",");

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      cb(null, true);
    } else {
      cb(new Error("CORS: origen no permitido"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Changuito backend en http://localhost:${PORT}`);
});
