const fs = require("fs");

const Tesseract = require("tesseract.js");

// pdf-parse v2
const {
    PDFParse
} = require("pdf-parse");


// =====================================================
// IMAGE OCR
// =====================================================

const extractTextFromImage = async (filePath) => {
    try {

        console.log("Starting image OCR...");


        // Check file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(
                "Image file not found"
            );
        }


        const result =
            await Tesseract.recognize(
                filePath,
                "eng",
                {
                    logger: (info) => {

                        if (
                            info.status ===
                                "recognizing text" &&
                            typeof info.progress ===
                                "number"
                        ) {

                            console.log(
                                `OCR Progress: ${Math.round(
                                    info.progress * 100
                                )}%`
                            );
                        }
                    }
                }
            );


        const text =
            result?.data?.text?.trim() || "";


        if (!text) {

            throw new Error(
                "No text could be extracted from image"
            );
        }


        console.log(
            "Image OCR completed successfully"
        );


        console.log(
            `Extracted Characters: ${text.length}`
        );


        return text;


    } catch (error) {

        console.error(
            "Image OCR Error:",
            error.message
        );


        throw new Error(
            "Failed to extract text from image"
        );
    }
};


// =====================================================
// PDF TEXT EXTRACTION
// =====================================================

const extractTextFromPDF = async (
    filePath
) => {

    let parser = null;


    try {

        console.log(
            "Starting PDF text extraction..."
        );


        // ---------------------------------------------
        // CHECK FILE
        // ---------------------------------------------

        if (!fs.existsSync(filePath)) {

            throw new Error(
                "PDF file not found"
            );
        }


        // ---------------------------------------------
        // READ PDF
        // ---------------------------------------------

        const pdfBuffer =
            fs.readFileSync(filePath);


        if (
            !pdfBuffer ||
            pdfBuffer.length === 0
        ) {

            throw new Error(
                "PDF file is empty"
            );
        }


        console.log(
            `PDF file size: ${pdfBuffer.length} bytes`
        );


        // ---------------------------------------------
        // CREATE PDF PARSER
        // pdf-parse v2.4.5
        // ---------------------------------------------

        parser =
            new PDFParse({
                data: pdfBuffer
            });


        // ---------------------------------------------
        // EXTRACT TEXT
        // ---------------------------------------------

        const result =
            await parser.getText();


        const text =
            result?.text?.trim() || "";


        // ---------------------------------------------
        // CHECK TEXT
        // ---------------------------------------------

        if (!text) {

            throw new Error(
                "No selectable text found in PDF. The PDF may be scanned or image-only."
            );
        }


        // ---------------------------------------------
        // LOG PDF INFORMATION
        // ---------------------------------------------

        console.log(
            "PDF text extraction completed successfully"
        );


        console.log(
            `PDF Pages: ${
                result?.total ||
                result?.numpages ||
                "Unknown"
            }`
        );


        console.log(
            `Extracted Characters: ${text.length}`
        );


        return text;


    } catch (error) {

        console.error(
            "PDF Extraction Error:",
            error.message
        );


        throw new Error(
            error.message ||
            "Failed to extract text from PDF"
        );


    } finally {

        // ---------------------------------------------
        // IMPORTANT:
        // Destroy parser to release resources
        // ---------------------------------------------

        if (parser) {

            try {

                await parser.destroy();

            } catch (destroyError) {

                console.error(
                    "PDF parser cleanup error:",
                    destroyError.message
                );
            }
        }
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    extractTextFromImage,

    extractTextFromPDF

};