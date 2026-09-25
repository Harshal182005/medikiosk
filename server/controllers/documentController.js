const fs = require("fs");

const Patient = require("../models/Patient");
const MedicalDocument =
    require("../models/MedicalDocument");

const {
    extractTextFromImage,
    extractTextFromPDF
} = require("../services/ocrService");

const {
    analyzeMedicalDocument
} = require("../services/documentAIService");


// ==========================================
// UPLOAD MEDICAL DOCUMENT
// ==========================================

const uploadMedicalDocument = async (
    req,
    res
) => {
    let uploadedFilePath = null;

    try {
        console.log(
            "================================="
        );

        console.log(
            "Medical document upload request"
        );

        console.log(
            "Body:",
            req.body
        );

        console.log(
            "File:",
            req.file
        );

        console.log(
            "================================="
        );


        // ------------------------------------------
        // VALIDATE PATIENT ID
        // ------------------------------------------

        const { patientId } =
            req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message:
                    "patientId is required"
            });
        }


        // ------------------------------------------
        // VALIDATE FILE
        // ------------------------------------------

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Medical document is required"
            });
        }


        uploadedFilePath =
            req.file.path;


        // ------------------------------------------
        // CHECK PATIENT
        // ------------------------------------------

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


        console.log(
            "Patient found:",
            patient.name
        );


        // ------------------------------------------
        // CREATE DOCUMENT RECORD
        // ------------------------------------------

        const medicalDocument =
            new MedicalDocument({
                patientId,

                originalName:
                    req.file.originalname,

                fileName:
                    req.file.filename,

                filePath:
                    req.file.path,

                mimeType:
                    req.file.mimetype,

                extractedText: "",

                aiSummary: "",

                ocrCompleted: false,

                aiAnalysisCompleted: false
            });


        await medicalDocument.save();


        console.log(
            "Medical document record created:",
            medicalDocument._id
        );


        // ------------------------------------------
        // EXTRACT TEXT
        // ------------------------------------------

        let extractedText = "";


        try {
            if (
                req.file.mimetype ===
                    "image/jpeg" ||
                req.file.mimetype ===
                    "image/jpg" ||
                req.file.mimetype ===
                    "image/png"
            ) {
                console.log(
                    "Processing image OCR..."
                );

                extractedText =
                    await extractTextFromImage(
                        uploadedFilePath
                    );

            } else if (
                req.file.mimetype ===
                "application/pdf"
            ) {
                console.log(
                    "Processing PDF..."
                );

                extractedText =
                    await extractTextFromPDF(
                        uploadedFilePath
                    );

            } else {
                throw new Error(
                    "Unsupported document type"
                );
            }

        } catch (ocrError) {
            console.error(
                "Text extraction failed:",
                ocrError
            );

            medicalDocument.extractedText =
                "";

            medicalDocument.ocrCompleted =
                false;

            await medicalDocument.save();

            return res.status(500).json({
                success: false,
                message:
                    "Failed to extract text from medical document",
                error:
                    ocrError.message
            });
        }


        // ------------------------------------------
        // SAVE EXTRACTED TEXT
        // ------------------------------------------

        medicalDocument.extractedText =
            extractedText || "";

        medicalDocument.ocrCompleted =
            Boolean(
                extractedText &&
                extractedText.trim()
            );

        await medicalDocument.save();


        console.log(
            "Text extraction completed."
        );

        console.log(
            "Extracted text length:",
            extractedText.length
        );


        // ------------------------------------------
        // AI DOCUMENT ANALYSIS
        // ------------------------------------------

        let aiSummary = "";


        if (
            extractedText &&
            extractedText.trim()
        ) {
            try {
                console.log(
                    "Starting Gemini medical document analysis..."
                );

                aiSummary =
                    await analyzeMedicalDocument(
                        extractedText
                    );

                medicalDocument.aiSummary =
                    aiSummary;

                medicalDocument.aiAnalysisCompleted =
                    true;

                await medicalDocument.save();


                console.log(
                    "AI document analysis completed successfully."
                );

            } catch (aiError) {
                console.error(
                    "AI document analysis failed:",
                    aiError
                );

                medicalDocument.aiSummary =
                    "AI analysis could not be completed. Doctor should review the original document.";

                medicalDocument.aiAnalysisCompleted =
                    false;

                await medicalDocument.save();

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to analyze medical document",
                    error:
                        aiError.message,

                    document: {
                        _id:
                            medicalDocument._id,
                        originalName:
                            medicalDocument.originalName,
                        extractedText:
                            medicalDocument.extractedText,
                        aiSummary:
                            medicalDocument.aiSummary
                    }
                });
            }
        } else {
            console.log(
                "No text extracted. Skipping AI analysis."
            );

            medicalDocument.aiSummary =
                "No readable text was extracted from this document. Doctor should review the original document.";

            medicalDocument.aiAnalysisCompleted =
                false;

            await medicalDocument.save();
        }


        // ------------------------------------------
        // DELETE TEMPORARY FILE
        // ------------------------------------------

        try {
            if (
                uploadedFilePath &&
                fs.existsSync(
                    uploadedFilePath
                )
            ) {
                fs.unlinkSync(
                    uploadedFilePath
                );

                console.log(
                    "Temporary uploaded file deleted."
                );
            }
        } catch (deleteError) {
            console.error(
                "Temporary file deletion error:",
                deleteError.message
            );
        }


        // ------------------------------------------
        // SUCCESS RESPONSE
        // ------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Medical document uploaded and processed successfully",

            document: {
                _id:
                    medicalDocument._id,

                patientId:
                    medicalDocument.patientId,

                originalName:
                    medicalDocument.originalName,

                mimeType:
                    medicalDocument.mimeType,

                extractedText:
                    medicalDocument.extractedText,

                aiSummary:
                    medicalDocument.aiSummary,

                ocrCompleted:
                    medicalDocument.ocrCompleted,

                aiAnalysisCompleted:
                    medicalDocument.aiAnalysisCompleted
            }
        });

    } catch (error) {
        console.error(
            "================================="
        );

        console.error(
            "Medical document controller error:"
        );

        console.error(error);

        console.error(
            "================================="
        );


        // Delete temporary file
        try {
            if (
                uploadedFilePath &&
                fs.existsSync(
                    uploadedFilePath
                )
            ) {
                fs.unlinkSync(
                    uploadedFilePath
                );
            }
        } catch (deleteError) {
            console.error(
                "Cleanup error:",
                deleteError.message
            );
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to upload medical document",
            error: error.message
        });
    }
};


// ==========================================
// GET PATIENT DOCUMENTS
// ==========================================

const getPatientDocuments = async (
    req,
    res
) => {
    try {
        const { patientId } =
            req.params;


        if (!patientId) {
            return res.status(400).json({
                success: false,
                message:
                    "patientId is required"
            });
        }


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


        const documents =
            await MedicalDocument.find({
                patientId
            })
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({
            success: true,
            count: documents.length,
            documents
        });

    } catch (error) {
        console.error(
            "Get patient documents error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get patient documents",
            error: error.message
        });
    }
};


module.exports = {
    uploadMedicalDocument,
    getPatientDocuments
};