const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./routes/auth.js");
require("dotenv").config();
const adoptionRoutes = require("./routes/adoption.js");
const chatRoutes = require("./routes/chat.js");
console.log("resolved adoptionRoutes:", require.resolve("./routes/adoption.js"));

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log("incoming request:", req.method, req.originalUrl);
  next();
});
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("API Running...");
});
app.use("/user", auth);
app.use("/adoptions", adoptionRoutes);
app.use("/chat", chatRoutes);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.log(err));