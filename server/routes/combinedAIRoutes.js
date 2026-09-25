const express = require("express");

const {
    generateCombinedSummary
} = require("../controllers/combinedAIController");

const router = express.Router();

router.post(
    "/generate-summary",
    generateCombinedSummary
);

module.exports = router;