const Patient = require("../models/Patient");
const MedicalDocument = require("../models/MedicalDocument");


// =====================================================
// DASHBOARD STATS
// =====================================================

const getDashboardStats = async (req, res) => {
    try {

        const totalPatients =
            await Patient.countDocuments();

        const completedInterviews =
            await Patient.countDocuments({
                "interview.completed": true
            });

        const totalDocuments =
            await MedicalDocument.countDocuments();

        return res.status(200).json({
            success: true,

            stats: {
                totalPatients,
                completedInterviews,
                totalDocuments
            }
        });

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats"
        });
    }
};



// =====================================================
// GET ALL PATIENTS
// =====================================================

const getAllPatients = async (req, res) => {
    try {

        const patients =
            await Patient.find()
                .select(
                    "name age gender phone preferredLanguage interview createdAt"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {

        console.error(
            "Get patients error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
};


// =====================================================
// SEARCH PATIENTS
// =====================================================

const searchPatients = async (req, res) => {
    try {

        const { query } = req.query;

        if (!query) {

            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }


        const patients =
            await Patient.find({
                $or: [
                    {
                        name: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        phone: {
                            $regex: query,
                            $options: "i"
                        }
                    }
                ]
            })
            .select(
                "name age gender phone preferredLanguage interview createdAt"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });

    } catch (error) {

        console.error(
            "Search patients error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to search patients"
        });
    }
};


// =====================================================
// GET PATIENT DETAILS
// =====================================================

const getPatientById = async (req, res) => {

    try {

        const { patientId } =
            req.params;


        const patient =
            await Patient.findById(
                patientId
            );


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found"

            });
        }


        // Get patient's medical documents
        const documents =
            await MedicalDocument.find({
                patientId
            })
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            patient,

            documents

        });


    } catch (error) {

        console.error(
            "Get patient details error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch patient details"

        });
    }
};

// ==========================================
// DOCTOR VERIFY PATIENT CASE
// ==========================================

const verifyPatientCase = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { notes } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        patient.doctorVerification = {
            status: "Reviewed",
            notes: notes || "",
            reviewedAt: new Date()
        };

        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Patient case marked as reviewed",
            verification: patient.doctorVerification
        });

    } catch (error) {
        console.error(
            "Doctor verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to verify patient case",
            error: error.message
        });
    }
};


module.exports = {

    getDashboardStats,

    getAllPatients,

    searchPatients,

    getPatientById,

    verifyPatientCase

};