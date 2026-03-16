import express from "express"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.route.js"
import msgRoutes from "./routes/msg.route.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use("api/auth", authRoutes)
app.use("api/msg", msgRoutes)

app.listen(3000, () => console.log("Server started at port: " + PORT))