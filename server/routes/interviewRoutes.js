const express = require("express");
const multer = require("multer");

const {
    getNextQuestion,
    saveAnswer,
    processVoiceAnswer
} = require("../controllers/interviewController");

const router = express.Router();


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
    dest: "uploads/"
});


// ======================================================
// GET NEXT AI QUESTION
// ======================================================

router.post(
    "/next-question",
    getNextQuestion
);


// ======================================================
// SAVE TEXT ANSWER
// ======================================================

router.post(
    "/save-answer",
    saveAnswer
);


// ======================================================
// VOICE ANSWER
// Audio → Speech-to-Text → Save → Next Question
// ======================================================

router.post(
    "/voice-answer",
    upload.single("audio"),
    processVoiceAnswer
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;