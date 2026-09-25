const express = require("express");

const {
    registerPatient,
    updatePatientHistory,
    getPatientById
} = require("../controllers/patientController");

const router = express.Router();


// Register patient
router.post(
    "/register",
    registerPatient
);


// Update patient medical history
router.put(
    "/history/:patientId",
    updatePatientHistory
);


// Get patient
router.get(
    "/:patientId",
    getPatientById
);


module.exports = router;