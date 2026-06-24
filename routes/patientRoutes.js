
const express = require("express");

const {
  addPatient,
  getPatients,
  callNextPatient,
  clearCompletedPatients,
} = require("../controllers/patientController");

const router = express.Router();

router.post("/add", addPatient);

router.get("/all", getPatients);

router.post("/next", callNextPatient);

router.delete(
  "/clear-completed",
  clearCompletedPatients
);

module.exports = router;
