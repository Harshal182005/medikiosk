const express = require("express");
const multer = require("multer");

const {
    uploadMedicalDocument,
    getPatientDocuments
} = require("../controllers/documentController");


const router = express.Router();


const upload = multer({
    dest: "uploads/",

    limits: {
        fileSize:
            10 * 1024 * 1024
    },

    fileFilter: (
        req,
        file,
        cb
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and PDF files are allowed"
                )
            );
        }
    }
});


router.post(
    "/upload",
    upload.single("document"),
    uploadMedicalDocument
);


router.get(
    "/patient/:patientId",
    getPatientDocuments
);


module.exports = router;