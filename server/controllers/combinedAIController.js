const Patient = require("../models/Patient");
const MedicalDocument = require("../models/MedicalDocument");

const {
    generateCombinedAISummary
} = require("../services/combinedAIService");


const generateCombinedSummary = async (req, res) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        const patient =
            await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const documents =
            await MedicalDocument.find({
                patientId: patientId
            }).sort({
                createdAt: -1
            });

        console.log(
            `Generating combined summary for patient: ${patient.name}`
        );

        console.log(
            `Documents found: ${documents.length}`
        );

        const summary =
            await generateCombinedAISummary(
                patient,
                documents
            );

        patient.combinedAISummary =
            summary;

        await patient.save();

        return res.status(200).json({
            success: true,
            message:
                "Combined AI summary generated successfully",
            summary: summary
        });

    } catch (error) {
        console.error(
            "Combined AI Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate combined AI summary",
            error: error.message
        });
    }
};


module.exports = {
    generateCombinedSummary
};