const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;
const mongoDB =
  process.env.DBURL ||
  "mongodb+srv://spatemplate28:3yHl8y63kOduKv0O@cluster0.yzp1qhd.mongodb.net/";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

mongoose.connect(mongoDB).catch((err) => console.error(err));

const configRouter = require("./routes/config");
const appointmentRouter = require("./routes/appointment");
const professionalRouter = require("./routes/professional");
const typeOfServiceRouter = require("./routes/typeOfService");
const cloudinaryRouter = require("./routes/cloudinary");
const mpRouter = require("./routes/mp");
const loginRouter = require("./routes/login");

// Rutas

app.use("/", configRouter);
app.use("/", appointmentRouter);
app.use("/", professionalRouter);
app.use("/", typeOfServiceRouter);
app.use("/", cloudinaryRouter);
app.use("/", mpRouter);
app.use("/", loginRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("server error");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log("luz verde")
});
