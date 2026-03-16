import express from "express";
import dotenv from "dotenv";
import path from "path";

import router from "./routes/auth.route.js";
import msgRoutes from "./routes/msg.route.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", router);
app.use("/api/msg", msgRoutes);

//make ready for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

app.listen(3000, () => console.log("Server started at port: " + PORT));
