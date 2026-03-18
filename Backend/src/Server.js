import express from "express";
import cookieParser from "cookie-parser"
import path from "path";
import cors from "cors";

import router from "./routes/auth.route.js";
import msgRoutes from "./routes/msg.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json()) //req.body
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})) //CORS
app.use(cookieParser())

app.use("/api/auth", router);
app.use("/api/msg", msgRoutes);

//make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

app.listen(3000, () => {
  console.log("Server started at port: " + PORT)
  connectDB()
});
