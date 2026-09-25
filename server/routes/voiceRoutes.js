
const express = require("express");
const multer = require("multer");

const {
    transcribePatientVoice
} = require("../controllers/voiceController");

const router = express.Router();

// Store uploaded audio temporarily
const upload = multer({
    dest: "uploads/"
});

// Speech-to-text endpoint
router.post(
    "/transcribe",
    upload.single("audio"),
    transcribePatientVoice
);

module.exports = router;
