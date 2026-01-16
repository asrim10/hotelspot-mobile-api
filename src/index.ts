import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin/user.routes";
dotenv.config();

console.log(process.env.PORT);

const app: Application = express();
app.use(bodyParser.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin/users", adminRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}
startServer();
