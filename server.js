const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

require("dotenv").config();

const patientRoutes = require("./routes/patientRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const Patient = require("./models/Patient");

setInterval(async () => {

  try {

    const servingPatient = await Patient.findOne({
      status: "serving",
    });

    if (!servingPatient) return;

    if (servingPatient.remainingTime > 0) {

      servingPatient.remainingTime -= 1;

      await servingPatient.save();

      io.emit("queueUpdated");

    }

  } catch (error) {

    console.log(error);

  }

}, 60000);



app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/patient", patientRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log(err);
  });

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Flowzen Backend Running");
});

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});