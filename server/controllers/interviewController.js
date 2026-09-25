
const fs = require("fs");

const Patient = require("../models/Patient");

const {
    generateNextQuestion
} = require("../services/interviewService");

const {
    transcribeAudio
} = require("../services/voiceService");


// ======================================================
// GET NEXT AI QUESTION
// ======================================================

const getNextQuestion = async (req, res) => {
    try {

        const {
            patientId,
            language,
            answers
        } = req.body;


        // Validate patient ID
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }


        // Find patient
        const patient = await Patient.findById(patientId);


        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        // Use answers from request,
        // otherwise use answers stored in MongoDB
        const interviewAnswers =
            answers || patient.interview.answers;


        // Generate next question using Gemini
        const question = await generateNextQuestion({
            language:
                language ||
                patient.preferredLanguage ||
                "English",

            answers: interviewAnswers
        });


        // Check if interview is complete
        if (question === "INTERVIEW_COMPLETE") {

            patient.interview.completed = true;

            await patient.save();


            return res.status(200).json({
                success: true,
                completed: true,
                question: null,
                message: "Patient interview completed"
            });
        }


        // Return next question
        res.status(200).json({
            success: true,
            completed: false,
            question
        });


    } catch (error) {

        console.error(
            "Interview question error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message: "Failed to generate interview question"
        });
    }
};



// ======================================================
// SAVE TEXT ANSWER
// ======================================================

const saveAnswer = async (req, res) => {
    try {

        const {
            patientId,
            question,
            answer
        } = req.body;


        // Validate data
        if (!patientId || !question || !answer) {

            return res.status(400).json({
                success: false,
                message:
                    "patientId, question and answer are required"
            });
        }


        // Find patient
        const patient = await Patient.findById(patientId);


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        // Save question + answer
        patient.interview.answers.push({
            question,
            answer
        });


        await patient.save();


        res.status(200).json({
            success: true,
            message: "Answer saved successfully",
            answers: patient.interview.answers
        });


    } catch (error) {

        console.error(
            "Save answer error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message: "Failed to save answer"
        });
    }
};



// ======================================================
// PROCESS VOICE ANSWER
// ======================================================

const processVoiceAnswer = async (req, res) => {
    try {

        const {
            patientId,
            question,
            language
        } = req.body;


        // Validate patient ID
        if (!patientId) {

            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }


        // Validate question
        if (!question) {

            return res.status(400).json({
                success: false,
                message: "question is required"
            });
        }


        // Validate audio
        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Audio file is required"
            });
        }


        // Find patient
        const patient = await Patient.findById(patientId);


        if (!patient) {

            // Delete uploaded file
            fs.unlink(req.file.path, () => {});


            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        console.log(
            "Processing voice answer for:",
            patient.name
        );


        console.log(
            "Audio file:",
            req.file.originalname
        );


        // ==================================================
        // SPEECH → TEXT
        // ==================================================

        const transcript = await transcribeAudio(
            req.file.path,
            req.file.mimetype
        );


        console.log(
            "Patient said:",
            transcript
        );


        // Delete temporary audio file
        fs.unlink(req.file.path, (error) => {

            if (error) {
                console.error(
                    "Failed to delete temporary audio:",
                    error.message
                );
            }

        });


        // ==================================================
        // SAVE ANSWER
        // ==================================================

        patient.interview.answers.push({

            question: question,

            answer: transcript

        });


        await patient.save();


        console.log(
            "Voice answer saved successfully"
        );


        // ==================================================
        // GENERATE NEXT QUESTION
        // ==================================================

        const nextQuestion =
            await generateNextQuestion({

                language:
                    language ||
                    patient.preferredLanguage ||
                    "English",

                answers:
                    patient.interview.answers

            });


        // ==================================================
        // INTERVIEW COMPLETE
        // ==================================================

        if (
            nextQuestion ===
            "INTERVIEW_COMPLETE"
        ) {

            patient.interview.completed = true;

            await patient.save();


            console.log(
                "Patient interview completed"
            );


            return res.status(200).json({

                success: true,

                completed: true,

                transcript,

                nextQuestion: null,

                message:
                    "Patient interview completed"

            });
        }


        // ==================================================
        // RETURN NEXT QUESTION
        // ==================================================

        res.status(200).json({

            success: true,

            completed: false,

            transcript,

            nextQuestion

        });


    } catch (error) {

        console.error(
            "Voice interview error:",
            error.message
        );


        // Delete temporary audio file
        if (req.file?.path) {

            fs.unlink(
                req.file.path,
                () => {}
            );

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to process voice answer"

        });

    }
};



// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {

    getNextQuestion,

    saveAnswer,

    processVoiceAnswer

};
