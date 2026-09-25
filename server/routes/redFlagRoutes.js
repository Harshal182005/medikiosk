const express = require("express");

const {
    generateRedFlags
} = require("../controllers/redFlagController");

const router = express.Router();

router.post(
    "/generate",
    generateRedFlags
);

module.exports = router;