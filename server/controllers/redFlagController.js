const Patient = require("../models/Patient");
const MedicalDocument = require("../models/MedicalDocument");
const {
    generateRedFlagAnalysis
} = require("../services/redFlagService");

const generateRedFlags = async (req, res) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        // Find patient
        const patient =
            await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Find patient's medical documents
        const documents =
            await MedicalDocument.find({
                patientId
            }).sort({
                createdAt: -1
            });

        console.log(
            `Generating AI attention indicators for: ${patient.name}`
        );

        console.log(
            `Documents found: ${documents.length}`
        );

        // Generate AI analysis
        const redFlags =
            await generateRedFlagAnalysis(
                patient,
                documents
            );

        // Save results
        patient.redFlags = redFlags;
        patient.redFlagAnalysisCompleted = true;

        await patient.save();

        return res.status(200).json({
            success: true,
            message:
                "AI attention-indicator analysis completed successfully",
            redFlags
        });

    } catch (error) {
        console.error(
            "Red Flag Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate AI attention indicators",
            error: error.message
        });
    }
};

module.exports = {
    generateRedFlags
};