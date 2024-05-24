const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDB = process.env.DBURL || "mongodb+srv://riseup123:2CHKNUZO1AaiSeLr@baseriseup.yfxwqd3.mongodb.net/app-peluqueria";

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

mongoose.connect(mongoDB).catch((err) => console.error(err));

var configRouter = require('./routes/config')

// Rutas

app.use('/', configRouter)

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("server error");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log("luz verde");
});
