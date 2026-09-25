const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


/**
 * Generate a doctor-ready summary from the patient's
 * AI interview conversation.
 */
const generateInterviewSummary = async (patientData) => {
    try {

        const answers = patientData.interview?.answers || [];

        if (answers.length === 0) {
            throw new Error("No interview answers available");
        }

        // Convert interview answers into readable conversation
        const conversation = answers
            .map(
                (item, index) =>
                    `${index + 1}. Question: ${item.question}\nPatient Answer: ${item.answer}`
            )
            .join("\n\n");


        const prompt = `
You are MediKiosk AI, an assistant that organizes
patient-provided information for a doctor.

The following information was collected during an
AI-assisted patient history interview.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT recommend treatment.
- Do NOT invent information.
- Use ONLY information provided in the interview.
- If information is missing, write "Not provided".
- Clearly identify information that requires doctor review.
- The final result is a draft and must be verified by a doctor.

PATIENT BASIC INFORMATION

Name:
${patientData.name || "Not provided"}

Age:
${patientData.age || "Not provided"}

Gender:
${patientData.gender || "Not provided"}

Preferred Language:
${patientData.preferredLanguage || "Not provided"}


PATIENT INTERVIEW

${conversation}


Create a concise doctor-ready summary using EXACTLY
the following sections:

1. Chief Complaint
- Main reason for the patient's visit.

2. Symptoms
- List symptoms reported by the patient.

3. Duration
- Mention duration if explicitly stated.
- Otherwise write "Not provided".

4. Severity
- Mention severity if explicitly stated.
- Otherwise write "Not provided".

5. Associated Symptoms
- List other symptoms reported by the patient.

6. Medical History
- Summarize previous illnesses or medical conditions
  explicitly reported.

7. Allergies
- List reported allergies.

8. Current Medications
- List medications reported by the patient.
- Do not recommend any medicines.

9. Previous Surgeries or Hospitalizations
- Include only if reported.

10. Family History
- Include only if reported.

11. Patient-Reported Information
- Include other relevant information from the interview.

12. Information Requiring Doctor Review
- List important information that the doctor should verify
  or investigate further.
- Do not provide a diagnosis.

End the summary with:

AI NOTE:
This is an AI-generated summary based only on
patient-reported information.
Doctor review and verification are required before
clinical decisions.
`;


        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: prompt
        });


        return interaction.output_text;

    } catch (error) {

        console.error(
            "Gemini Interview Summary Error:",
            error.message
        );

        throw new Error(
            "Failed to generate interview summary"
        );
    }
};


module.exports = {
    generateInterviewSummary
};
