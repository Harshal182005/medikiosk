
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/**
 * Convert patient audio into text.
 */
const transcribeAudio = async (filePath, mimeType) => {
    try {
        console.log("Uploading audio to Gemini...");

        const audioFile = await ai.files.upload({
            file: filePath,
            config: {
                mimeType: mimeType
            }
        });

        console.log("Audio uploaded successfully");

        const interaction = await ai.interactions.create({
            model: "gemini-3.5-transcribe",
            input: [
                {
                    type: "audio",
                    uri: audioFile.uri,
                    mime_type: audioFile.mimeType
                }
            ],
            generation_config: {
                transcription_config: {
                    mode: {
                        type: "verbatim"
                    }
                }
            }
        });

        const transcript = interaction.output_text?.trim();

        if (!transcript) {
            throw new Error("No speech could be transcribed");
        }

        console.log("Transcription:", transcript);

        return transcript;

    } catch (error) {
        console.error("Speech-to-text error:", error.message);

        throw new Error(
            "Failed to convert patient speech to text"
        );
    }
};

module.exports = {
    transcribeAudio
};
