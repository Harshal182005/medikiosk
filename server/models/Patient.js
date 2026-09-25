const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            required: true
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"]
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        preferredLanguage: {
            type: String,
            default: "English"
        },

        medicalHistory: {
            type: String,
            default: ""
        },

        allergies: {
            type: String,
            default: ""
        },

        currentMedications: {
            type: String,
            default: ""
        },

        symptoms: {
            type: String,
            default: ""
        },
        aiSummary: {
            type: String,
            default: ""
        },
                
        interview: {
            completed: {
                type: Boolean,
                default: false
            },

            answers: [
                {
                    question: {
                        type: String,
                        required: true
                    },

                    answer: {
                        type: String,
                        required: true
                    }
                }
            ]
        },

        aiSummary: {
            type: String,
            default: ""
        },
        combinedAISummary: {
            type: String,
            default: ""
        },
        redFlags: [
    {
        category: {
            type: String,
            default: ""
        },

        finding: {
            type: String,
            default: ""
        },

        source: {
            type: String,
            default: ""
        },

        reason: {
            type: String,
            default: ""
        }
    }
],

        redFlagAnalysisCompleted: {
            type: Boolean,
            default: false
        },
        doctorVerification: {
    status: {
        type: String,
        enum: [
            "Pending",
            "Reviewed"
        ],
        default: "Pending"
    },

    notes: {
        type: String,
        default: ""
    },

    reviewedAt: {
        type: Date,
        default: null
    }
},
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Patient", patientSchema);