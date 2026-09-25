const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateCombinedAISummary = async (
    patient,
    documents = []
) => {
    try {
        // =====================================================
        // PATIENT INFORMATION
        // =====================================================

        const patientInfo = `
Name: ${patient.name || "Not provided"}
Age: ${patient.age ?? "Not provided"}
Gender: ${patient.gender || "Not provided"}
Phone: ${patient.phone || "Not provided"}
Preferred Language: ${
            patient.preferredLanguage || "English"
        }

Medical History:
${patient.medicalHistory || "Not provided"}

Allergies:
${patient.allergies || "Not provided"}

Current Medications:
${patient.currentMedications || "Not provided"}

Symptoms:
${patient.symptoms || "Not provided"}
`;

        // =====================================================
        // INTERVIEW INFORMATION
        // =====================================================

        let interviewText = "No interview information available.";

        if (
            patient.interview &&
            patient.interview.answers &&
            patient.interview.answers.length > 0
        ) {
            interviewText =
                patient.interview.answers
                    .map((item, index) => {
                        return `
Question ${index + 1}: ${
                            item.question || "Not available"
                        }
Patient Answer: ${
                            item.answer || "Not available"
                        }
`;
                    })
                    .join("\n");
        }

        // =====================================================
        // DOCUMENT INFORMATION
        // =====================================================

        let documentText =
            "No medical documents available.";

        if (documents.length > 0) {
            documentText = documents
                .map((document, index) => {
                    return `
-------------------------------
DOCUMENT ${index + 1}
-------------------------------

File Name:
${document.originalName || "Unknown"}

OCR Extracted Text:
${document.extractedText || "No OCR text available."}

AI Document Analysis:
${document.aiSummary || "No AI document analysis available."}
`;
                })
                .join("\n");
        }

        // =====================================================
        // GEMINI PROMPT
        // =====================================================

        const prompt = `
You are an AI medical documentation assistant
working inside a patient case-taking system called MediKiosk.

Your task is to organize the information collected from:

1. Patient registration
2. Patient-provided medical history
3. Patient interview answers
4. Uploaded medical documents
5. OCR extracted text
6. Previous AI document analysis

Create a clear doctor-ready documentation summary.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT recommend treatment.
- Do NOT invent missing information.
- Do NOT assume that an AI interpretation is correct.
- Clearly distinguish patient-reported information from information extracted from documents.
- If information is missing, write "Not provided".
- Preserve important uncertainty.
- The doctor must verify the information against the original documents and patient responses.

Use exactly these sections:

1. Patient Information

2. Chief Complaint / Main Concern

3. Current Symptoms

4. Symptom Duration

5. Symptom Severity

6. Associated Symptoms

7. Medical History

8. Allergies

9. Current Medications

10. Previous Surgeries or Hospitalizations

11. Family History

12. Patient Interview Findings

13. Medical Document Findings

14. Tests and Investigations Mentioned

15. Medicines Mentioned in Documents

16. Important Information Requiring Doctor Review

17. Information Gaps / Missing Information

18. Documentation Notes

At the end write:

AI DOCUMENTATION NOTE:
This summary is generated from patient-provided information and uploaded medical documents. It is intended only to assist clinical documentation. The doctor must independently verify all information and review the original medical documents before making clinical decisions.

PATIENT INFORMATION:
${patientInfo}

PATIENT INTERVIEW:
${interviewText}

MEDICAL DOCUMENTS:
${documentText}
`;

        console.log(
            "Sending combined patient information to Gemini..."
        );

        // =====================================================
        // GEMINI REQUEST
        // =====================================================

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt
        });

        const summary =
            response.text?.trim();

        if (!summary) {
            throw new Error(
                "Gemini returned an empty combined summary."
            );
        }

        console.log(
            "Combined AI summary generated successfully."
        );

        return summary;

    } catch (error) {
        console.error(
            "Combined AI Service Error:",
            error.message
        );

        throw new Error(
            "Failed to generate combined AI summary."
        );
    }
};

module.exports = {
    generateCombinedAISummary
};