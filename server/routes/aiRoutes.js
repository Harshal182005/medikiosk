const express = require("express");

const {
    generateSummary
} = require("../controllers/aiController");

const router = express.Router();

// Generate AI patient case summary
router.post("/generate-summary", generateSummary);

module.exports = router;
