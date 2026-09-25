const express = require("express");

const {
    getDashboardStats,
    searchPatients,
    getAllPatients,
    getPatientById,
    verifyPatientCase
} = require("../controllers/doctorController");

const router = express.Router();

// Dashboard statistics
router.get(
    "/stats",
    getDashboardStats
);

// Search patients
router.get(
    "/search",
    searchPatients
);

// Get all patients
router.get(
    "/patients",
    getAllPatients
);

// Get single patient details
router.get(
    "/patients/:patientId",
    getPatientById
);

// Verify patient case
router.put(
    "/patients/:patientId/verify",
    verifyPatientCase
);

module.exports = router;