
const fs = require("fs");

const {
    transcribeAudio
} = require("../services/voiceService");


// Convert patient voice recording to text
const transcribePatientVoice = async (req, res) => {
    try {

        // Check uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Audio file is required"
            });
        }

        console.log(
            "Received audio:",
            req.file.originalname
        );

        const transcript = await transcribeAudio(
            req.file.path,
            req.file.mimetype
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

        res.status(200).json({
            success: true,
            message: "Speech converted to text successfully",
            transcript
        });

    } catch (error) {

        console.error(
            "Voice controller error:",
            error.message
        );

        // Try to remove temporary file
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        res.status(500).json({
            success: false,
            message: "Failed to transcribe audio"
        });
    }
};

module.exports = {
    transcribePatientVoice
};
