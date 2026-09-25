const Patient = require("../models/Patient");

// ==========================================
// REGISTER PATIENT
// ==========================================

const registerPatient = async (req, res) => {
    try {
        console.log("=================================");
        console.log("Patient registration request");
        console.log("Received body:", req.body);
        console.log("=================================");

        const {
            name,
            age,
            gender,
            phone,
            preferredLanguage
        } = req.body;

        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        if (
            age === undefined ||
            age === null ||
            age === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Age is required"
            });
        }

        const numericAge = Number(age);

        if (
            Number.isNaN(numericAge) ||
            numericAge < 1 ||
            numericAge > 120
        ) {
            return res.status(400).json({
                success: false,
                message: "Age must be between 1 and 120"
            });
        }

        if (!gender) {
            return res.status(400).json({
                success: false,
                message: "Gender is required"
            });
        }

        const allowedGenders = [
            "Male",
            "Female",
            "Other"
        ];

        if (!allowedGenders.includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gender"
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // ------------------------------------------
        // CREATE PATIENT
        // ------------------------------------------

        const patient = new Patient({
            name: name.trim(),

            age: numericAge,

            gender,

            phone: phone.trim(),

            preferredLanguage:
                preferredLanguage || "English"
        });

        const savedPatient =
            await patient.save();

        console.log(
            "Patient registered successfully:",
            savedPatient._id
        );

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Patient registered successfully",

            patient: {
                _id: savedPatient._id,
                name: savedPatient.name,
                age: savedPatient.age,
                gender: savedPatient.gender,
                phone: savedPatient.phone,
                preferredLanguage:
                    savedPatient.preferredLanguage
            }
        });

    } catch (error) {
        console.error(
            "Patient registration error:",
            error
        );

        // MongoDB validation error
        if (
            error.name ===
            "ValidationError"
        ) {
            const messages =
                Object.values(
                    error.errors
                )
                    .map(
                        (item) =>
                            item.message
                    )
                    .join(", ");

            return res.status(400).json({
                success: false,
                message:
                    messages ||
                    "Patient validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to register patient",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE PATIENT HISTORY
// ==========================================

const updatePatientHistory = async (
    req,
    res
) => {
    try {
        const { patientId } = req.params;

        const {
            medicalHistory,
            allergies,
            currentMedications,
            symptoms
        } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        const patient =
            await Patient.findById(
                patientId
            );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        if (
            medicalHistory !== undefined
        ) {
            patient.medicalHistory =
                medicalHistory;
        }

        if (
            allergies !== undefined
        ) {
            patient.allergies =
                allergies;
        }

        if (
            currentMedications !== undefined
        ) {
            patient.currentMedications =
                currentMedications;
        }

        if (
            symptoms !== undefined
        ) {
            patient.symptoms =
                symptoms;
        }

        await patient.save();

        return res.status(200).json({
            success: true,
            message:
                "Patient history updated successfully",
            patient
        });

    } catch (error) {
        console.error(
            "Update patient history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update patient history",
            error: error.message
        });
    }
};


// ==========================================
// GET PATIENT BY ID
// ==========================================

const getPatientById = async (
    req,
    res
) => {
    try {
        const { patientId } = req.params;

        const patient =
            await Patient.findById(
                patientId
            );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        return res.status(200).json({
            success: true,
            patient
        });

    } catch (error) {
        console.error(
            "Get patient error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get patient",
            error: error.message
        });
    }
};


module.exports = {
    registerPatient,
    updatePatientHistory,
    getPatientById
};