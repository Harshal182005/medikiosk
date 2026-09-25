
const Patient = require("../models/Patient");

const {
    generateInterviewSummary
} = require("../services/aiService");


// Generate summary from complete AI interview
const generateSummary = async (req, res) => {

    try {

        const { patientId } = req.body;


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


        // Make sure interview exists
        if (
            !patient.interview ||
            patient.interview.answers.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Patient interview has no answers"
            });
        }


        console.log(
            "Generating AI summary for:",
            patient.name
        );


        // Generate summary from interview
        const summary =
            await generateInterviewSummary(patient);


        // Save summary in MongoDB
        patient.aiSummary = summary;

        await patient.save();


        console.log(
            "AI interview summary saved successfully"
        );


        res.status(200).json({

            success: true,

            message:
                "AI interview summary generated successfully",

            patientId: patient._id,

            summary: patient.aiSummary

        });


    } catch (error) {

        console.error(
            "AI summary controller error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to generate AI interview summary"

        });

    }
};


module.exports = {
    generateSummary
};
