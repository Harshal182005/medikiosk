const {
    GoogleGenAI
} = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==========================================
// WAIT FUNCTION
// ==========================================

const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};


// ==========================================
// CHECK WHETHER ERROR IS TEMPORARY
// ==========================================

const isTemporaryError = (error) => {
    const status =
        error?.status ||
        error?.code;

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    );
};


// ==========================================
// GENERATE GEMINI RESPONSE
// ==========================================

const generateWithFallback = async (
    prompt
) => {

    /*
        First try the model that is currently
        working elsewhere in MediKiosk.

        If Google returns a temporary 503/429,
        retry and then use a fallback model.
    */

    const models = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite"
    ];


    let lastError = null;


    for (
        let modelIndex = 0;
        modelIndex < models.length;
        modelIndex++
    ) {

        const model =
            models[modelIndex];


        // --------------------------------------
        // TRY CURRENT MODEL UP TO 2 TIMES
        // --------------------------------------

        for (
            let attempt = 1;
            attempt <= 2;
            attempt++
        ) {

            try {

                console.log(
                    `Gemini model: ${model}`
                );

                console.log(
                    `Gemini attempt: ${attempt}/2`
                );


                const response =
                    await ai.models.generateContent({
                        model,
                        contents: prompt
                    });


                const text =
                    response.text?.trim();


                if (!text) {
                    throw new Error(
                        "Gemini returned an empty response."
                    );
                }


                console.log(
                    `Gemini response received successfully using ${model}`
                );


                return text;


            } catch (error) {

                lastError = error;


                console.error(
                    `Gemini ${model} attempt ${attempt} failed:`,
                    error?.message ||
                    error
                );


                // ----------------------------------
                // NON-TEMPORARY ERROR
                // ----------------------------------

                if (
                    !isTemporaryError(error)
                ) {

                    throw error;
                }


                // ----------------------------------
                // TEMPORARY ERROR
                // ----------------------------------

                if (attempt < 2) {

                    console.log(
                        "Temporary Gemini error. Retrying in 3 seconds..."
                    );

                    await wait(3000);
                }
            }
        }


        // --------------------------------------
        // MOVE TO FALLBACK MODEL
        // --------------------------------------

        if (
            modelIndex <
            models.length - 1
        ) {

            console.log(
                `Model ${model} unavailable. Switching to fallback model...`
            );

            await wait(1000);
        }
    }


    throw lastError ||
        new Error(
            "All Gemini models are temporarily unavailable."
        );
};


// ==========================================
// ANALYZE MEDICAL DOCUMENT
// ==========================================

const analyzeMedicalDocument = async (
    extractedText
) => {

    try {

        if (
            !extractedText ||
            !extractedText.trim()
        ) {

            throw new Error(
                "No extracted text available for AI analysis."
            );
        }


        /*
            Prevent extremely large OCR text
            from unnecessarily consuming tokens.
        */

        const cleanedText =
            extractedText
                .trim()
                .slice(0, 30000);


        const prompt = `
You are an AI medical documentation assistant
inside a patient case-taking system called MediKiosk.

You are analyzing text extracted from a patient's
previous medical document.

Your job is ONLY to organize information that is
explicitly present in the document.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT recommend treatment.
- Do NOT invent information.
- Do NOT assume missing information.
- Do NOT convert uncertain information into facts.
- Clearly state when information is not available.
- The doctor must verify everything against the original document.
- This is documentation assistance only.

Use exactly these sections:

1. Document Type

2. Patient Information

3. Medical Conditions Mentioned

4. Symptoms Mentioned

5. Medicines Mentioned

6. Tests and Investigations

7. Results

8. Previous Medical History

9. Procedures or Surgeries

10. Important Information

11. Information Requiring Doctor Review

12. Missing or Unclear Information

At the end write:

AI DOCUMENTATION NOTE:
This analysis is generated from text extracted from a medical document. It is intended only to assist clinical documentation. The doctor must independently verify the information against the original document before making clinical decisions.

MEDICAL DOCUMENT TEXT:

${cleanedText}
`;


        console.log(
            "Sending medical document text to Gemini..."
        );


        const summary =
            await generateWithFallback(
                prompt
            );


        console.log(
            "Medical document AI analysis completed successfully."
        );


        return summary;


    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "Document AI Service Error:"
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );


        throw new Error(
            error?.message ||
            "Failed to analyze medical document"
        );
    }
};


module.exports = {
    analyzeMedicalDocument
};