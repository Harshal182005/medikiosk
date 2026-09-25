const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/*
    Generate AI attention indicators from:

    1. Patient information
    2. Medical history
    3. Allergies
    4. Current medications
    5. Symptoms
    6. Patient interview
    7. Uploaded medical documents
*/

const generateRedFlagAnalysis = async (
    patient,
    documents = []
) => {
    try {
        // ============================================
        // PATIENT INFORMATION
        // ============================================

        const patientInfo = `
Name: ${patient.name || "Not provided"}
Age: ${patient.age ?? "Not provided"}
Gender: ${patient.gender || "Not provided"}
Preferred Language: ${
            patient.preferredLanguage || "English"
        }

Medical History:
${patient.medicalHistory || "Not provided"}

Allergies:
${patient.allergies || "Not provided"}

Current Medications:
${
            patient.currentMedications ||
            "Not provided"
        }

Symptoms:
${patient.symptoms || "Not provided"}
`;

        // ============================================
        // INTERVIEW INFORMATION
        // ============================================

        let interviewText =
            "No interview information available.";

        if (
            patient.interview &&
            patient.interview.answers &&
            patient.interview.answers.length > 0
        ) {
            interviewText =
                patient.interview.answers
                    .map((item, index) => {
                        return `
Question ${index + 1}:
${item.question || "Not available"}

Patient Answer:
${item.answer || "Not available"}
`;
                    })
                    .join("\n");
        }

        // ============================================
        // MEDICAL DOCUMENT INFORMATION
        // ============================================

        let documentText =
            "No medical documents available.";

        if (documents.length > 0) {
            documentText = documents
                .map((document, index) => {
                    return `
==============================
DOCUMENT ${index + 1}
==============================

File Name:
${
                        document.originalName ||
                        "Unknown"
                    }

Extracted Text:
${
                        document.extractedText ||
                        "No extracted text available."
                    }

AI Document Analysis:
${
                        document.aiSummary ||
                        "No AI document analysis available."
                    }
`;
                })
                .join("\n");
        }

        // ============================================
        // AI PROMPT
        // ============================================

        const prompt = `
You are an AI medical documentation assistant
inside a patient case-taking system called MediKiosk.

Your task is to identify information that may require
ATTENTION OR VERIFICATION BY A DOCTOR.

You are NOT a doctor.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT recommend treatment.
- Do NOT tell the doctor what treatment to provide.
- Do NOT invent information.
- Do NOT assume missing information.
- Only use information provided by the patient or documents.
- These indicators are NOT diagnoses.
- The doctor must independently verify every finding.

Look for potentially important information such as:

- Reported allergies
- Severe or worsening symptoms
- Symptoms requiring urgent clinical review
- Abnormal test results explicitly mentioned in documents
- Important medical history
- Previous serious conditions
- Medication-related information
- Contradictions between patient answers and documents
- Missing information that may need clarification
- Other findings that clearly require doctor review

IMPORTANT:

Do NOT automatically label ordinary symptoms as emergencies.

Only identify something as an attention indicator when
there is information in the supplied data that supports it.

Return ONLY valid JSON.

Use exactly this structure:

{
    "redFlags": [
        {
            "category": "string",
            "finding": "string",
            "source": "string",
            "reason": "string"
        }
    ]
}

If there is no information requiring an attention indicator,
return:

{
    "redFlags": []
}

PATIENT INFORMATION:
${patientInfo}

PATIENT INTERVIEW:
${interviewText}

MEDICAL DOCUMENTS:
${documentText}
`;

        console.log(
            "Sending patient information to Gemini for AI attention-indicator analysis..."
        );

        // ============================================
        // GEMINI
        // ============================================

        const response =
            await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt
            });

        const responseText =
            response.text?.trim();

        if (!responseText) {
            throw new Error(
                "Gemini returned an empty response."
            );
        }

        console.log(
            "Gemini attention-indicator response received."
        );

        // ============================================
        // CLEAN JSON RESPONSE
        // ============================================

        let cleanedResponse =
            responseText;

        // Remove markdown code fences if Gemini
        // returns ```json ... ```
        cleanedResponse =
            cleanedResponse
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();

        // ============================================
        // PARSE JSON
        // ============================================

        let parsedResponse;

        try {
            parsedResponse =
                JSON.parse(
                    cleanedResponse
                );
        } catch (parseError) {
            console.error(
                "Failed to parse Gemini JSON:"
            );

            console.error(
                responseText
            );

            throw new Error(
                "AI returned an invalid attention-indicator response."
            );
        }

        // ============================================
        // VALIDATE RESPONSE
        // ============================================

        if (
            !parsedResponse ||
            !Array.isArray(
                parsedResponse.redFlags
            )
        ) {
            throw new Error(
                "Invalid AI attention-indicator format."
            );
        }

        // ============================================
        // NORMALIZE FLAGS
        // ============================================

        const redFlags =
            parsedResponse.redFlags
                .map((flag) => ({
                    category:
                        flag.category ||
                        "Doctor Review",

                    finding:
                        flag.finding ||
                        "Information requires doctor review.",

                    source:
                        flag.source ||
                        "Patient Information",

                    reason:
                        flag.reason ||
                        "Doctor verification required."
                }));

        console.log(
            `AI attention-indicator analysis completed. Indicators found: ${redFlags.length}`
        );

        return redFlags;

    } catch (error) {
        console.error(
            "Red Flag Service Error:",
            error.message
        );

        throw new Error(
            "Failed to generate AI attention indicators."
        );
    }
};


// ============================================
// EXPORT
// ============================================

module.exports = {
    generateRedFlagAnalysis
};