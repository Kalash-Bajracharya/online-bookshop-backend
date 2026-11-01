import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns"

import { connectDB } from "./config/db.js";
import { upload } from "./config/files.js";
import { fileURLToPath } from "url";
import path from "path";
import { seedAdmin } from "./config/seedAdmin.js";

import userRoutes from "./routes/userRoutes.js"
import booksRoutes from "./routes/booksRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
dns.setServers(["8.8.8.8","1.1.1.1"])

const app = express();
app.use(express.json());
app.use(cors());

connectDB();
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.post('/bookCover', upload.single('image'), function (req, res, next) {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  console.log(req.file, req.body)
  res.send("done")
});

app.use("/books", booksRoutes )
app.use("/users",userRoutes)
app.use("/cart",cartRoutes)
app.use("/orders", orderRoutes);


app.get("/", (req, res) => {
  res.send("Hello World");
});

await seedAdmin()

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});