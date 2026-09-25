import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

function MedicalDocumentUpload() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const patientId = localStorage.getItem("patientId");
    const patientName =
        localStorage.getItem("patientName") || "Patient";
    const language =
        localStorage.getItem("patientLanguage") || "English";

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [documents, setDocuments] = useState([]);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("info");

    const [dragging, setDragging] = useState(false);

    const [processingStep, setProcessingStep] =
        useState("");

    // ==========================================
    // LOAD DOCUMENTS
    // ==========================================

    const loadDocuments = async () => {
        if (!patientId) {
            return;
        }

        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/documents/patient/${patientId}`
            );

            setDocuments(
                response.data?.documents || []
            );
        } catch (error) {
            console.error(
                "Load documents error:",
                error
            );
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // ==========================================
    // FILE VALIDATION
    // ==========================================

    const validateFile = (file) => {
        if (!file) {
            return false;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];

        if (!allowedTypes.includes(file.type)) {
            setMessage(
                "Only JPG, PNG and PDF files are allowed."
            );

            setMessageType("error");

            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            setMessage(
                "File size must be less than 10 MB."
            );

            setMessageType("error");

            return false;
        }

        setMessage("");
        return true;
    };

    // ==========================================
    // SELECT FILE
    // ==========================================

    const handleFileSelect = (file) => {
        if (!validateFile(file)) {
            return;
        }

        setSelectedFile(file);
        setMessage("");
        setMessageType("info");
    };

    const handleInputChange = (event) => {
        const file =
            event.target.files?.[0];

        handleFileSelect(file);
    };

    // ==========================================
    // DRAG & DROP
    // ==========================================

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);

        const file =
            event.dataTransfer.files?.[0];

        handleFileSelect(file);
    };

    // ==========================================
    // UPLOAD
    // ==========================================

    const handleUpload = async () => {
        if (!patientId) {
            setMessage(
                "Patient information not found. Please register again."
            );

            setMessageType("error");

            return;
        }

        if (!selectedFile) {
            setMessage(
                "Please select a medical document first."
            );

            setMessageType("error");

            return;
        }

        try {
            setUploading(true);
            setMessage("");

            // STEP 1
            setProcessingStep(
                "Uploading your document..."
            );

            const formData = new FormData();

            formData.append(
                "document",
                selectedFile
            );

            formData.append(
                "patientId",
                patientId
            );

            // STEP 2
            setTimeout(() => {
                setProcessingStep(
                    "Reading document with OCR..."
                );
            }, 800);

            // STEP 3
            setTimeout(() => {
                setProcessingStep(
                    "Organizing information with AI..."
                );
            }, 2500);

            const response = await axios.post(
                `${BACKEND_URL}/api/documents/upload`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(
                "Document upload response:",
                response.data
            );

            setProcessingStep(
                "Document processed successfully."
            );

            setMessage(
                response.data?.message ||
                "Medical document processed successfully."
            );

            setMessageType("success");

            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await loadDocuments();

        } catch (error) {
            console.error(
                "Document upload error:",
                error
            );

            setProcessingStep("");

            setMessage(
                error.response?.data?.message ||
                "Failed to process medical document."
            );

            setMessageType("error");

        } finally {
            setUploading(false);
        }
    };

    // ==========================================
    // REMOVE SELECTED FILE
    // ==========================================

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setMessage("");
        setProcessingStep("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ==========================================
    // FORMAT FILE SIZE
    // ==========================================

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "";
        }

        const mb =
            bytes / (1024 * 1024);

        return `${mb.toFixed(2)} MB`;
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "Unknown date";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    };

    // ==========================================
    // FINISH
    // ==========================================

    const handleFinish = () => {
        navigate("/patient");
    };

    return (
        <div className="documents-page">

            {/* ======================================
                NAVBAR
            ====================================== */}

            <nav className="documents-navbar">

                <div className="brand">

                    <div className="brand-logo">
                        +
                    </div>

                    <div>
                        <strong>
                            MediKiosk
                        </strong>

                        <span>
                            AI-assisted patient care
                        </span>
                    </div>

                </div>

                <div className="navbar-right">

                    <div className="patient-name">
                        {patientName}
                    </div>

                    <div className="language-pill">
                        🌐 {language}
                    </div>

                </div>

            </nav>

            {/* ======================================
                MAIN
            ====================================== */}

            <main className="documents-container">

                {/* HEADER */}

                <div className="page-header">

                    <div>

                        <div className="small-label">
                            MEDICAL DOCUMENTS
                        </div>

                        <h1>
                            Add your previous reports
                        </h1>

                        <p>
                            Upload prescriptions, laboratory
                            reports, scans or other medical
                            documents from previous visits.
                        </p>

                    </div>

                    <div className="step-badge">
                        <span>2</span>
                        of 3
                    </div>

                </div>

                {/* PROGRESS */}

                <div className="step-progress">

                    <div className="progress-line">

                        <div className="progress-done"></div>

                    </div>

                    <div className="progress-labels">

                        <span className="done">
                            ✓ Registration
                        </span>

                        <span className="active">
                            2. Medical Documents
                        </span>

                        <span>
                            3. Doctor Review
                        </span>

                    </div>

                </div>

                {/* ==================================
                    UPLOAD CARD
                ================================== */}

                <section className="upload-card">

                    <div className="upload-card-header">

                        <div>
                            <h2>
                                Upload a document
                            </h2>

                            <p>
                                We support PDF, JPG and PNG
                                files up to 10 MB.
                            </p>
                        </div>

                        <div className="supported-icons">
                            <span>PDF</span>
                            <span>JPG</span>
                            <span>PNG</span>
                        </div>

                    </div>

                    {/* DROP ZONE */}

                    {!selectedFile && (
                        <div
                            className={
                                dragging
                                    ? "drop-zone dragging"
                                    : "drop-zone"
                            }
                            onDragOver={
                                handleDragOver
                            }
                            onDragLeave={
                                handleDragLeave
                            }
                            onDrop={handleDrop}
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={
                                    handleInputChange
                                }
                                hidden
                            />

                            <div className="upload-icon">
                                ↑
                            </div>

                            <h3>
                                Drop your medical document here
                            </h3>

                            <p>
                                or{" "}
                                <span>
                                    browse from your computer
                                </span>
                            </p>

                            <small>
                                Maximum file size: 10 MB
                            </small>

                        </div>
                    )}

                    {/* SELECTED FILE */}

                    {selectedFile && (
                        <div className="selected-file">

                            <div className="file-icon">
                                {selectedFile.type ===
                                "application/pdf"
                                    ? "PDF"
                                    : "IMG"}
                            </div>

                            <div className="file-info">

                                <strong>
                                    {selectedFile.name}
                                </strong>

                                <span>
                                    {formatFileSize(
                                        selectedFile.size
                                    )}
                                </span>

                            </div>

                            <button
                                type="button"
                                className="remove-file"
                                onClick={
                                    removeSelectedFile
                                }
                                disabled={uploading}
                            >
                                ×
                            </button>

                        </div>
                    )}

                    {/* PROCESSING */}

                    {uploading && (
                        <div className="processing-box">

                            <div className="processing-spinner">
                                <span></span>
                            </div>

                            <div>

                                <strong>
                                    Processing document
                                </strong>

                                <p>
                                    {processingStep ||
                                        "Please wait..."}
                                </p>

                            </div>

                        </div>
                    )}

                    {/* MESSAGE */}

                    {message && (
                        <div
                            className={
                                messageType ===
                                "success"
                                    ? "message success"
                                    : messageType ===
                                      "error"
                                    ? "message error"
                                    : "message info"
                            }
                        >
                            <span>
                                {messageType ===
                                "success"
                                    ? "✓"
                                    : messageType ===
                                      "error"
                                    ? "!"
                                    : "i"}
                            </span>

                            {message}
                        </div>
                    )}

                    {/* ACTION */}

                    {selectedFile && !uploading && (
                        <button
                            type="button"
                            className="upload-button"
                            onClick={
                                handleUpload
                            }
                        >
                            Process Medical Document
                            <span>→</span>
                        </button>
                    )}

                </section>

                {/* ==================================
                    AI PROCESS
                ================================== */}

                <section className="ai-section">

                    <div className="ai-section-header">

                        <div className="ai-icon">
                            ✦
                        </div>

                        <div>

                            <h2>
                                What MediKiosk does with your document
                            </h2>

                            <p>
                                Your document is processed to help
                                your doctor understand your history.
                            </p>

                        </div>

                    </div>

                    <div className="ai-process">

                        <div className="process-item">

                            <div className="process-number">
                                01
                            </div>

                            <div>
                                <strong>
                                    OCR Extraction
                                </strong>

                                <span>
                                    Text is extracted from
                                    scanned reports.
                                </span>
                            </div>

                        </div>

                        <div className="process-connector"></div>

                        <div className="process-item">

                            <div className="process-number">
                                02
                            </div>

                            <div>
                                <strong>
                                    AI Organization
                                </strong>

                                <span>
                                    Medical information is
                                    organized into useful sections.
                                </span>
                            </div>

                        </div>

                        <div className="process-connector"></div>

                        <div className="process-item">

                            <div className="process-number">
                                03
                            </div>

                            <div>
                                <strong>
                                    Doctor Review
                                </strong>

                                <span>
                                    The doctor verifies the
                                    information before decisions.
                                </span>
                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================
                    UPLOADED DOCUMENTS
                ================================== */}

                {documents.length > 0 && (
                    <section className="uploaded-section">

                        <div className="section-heading">

                            <div>
                                <h2>
                                    Uploaded documents
                                </h2>

                                <p>
                                    {documents.length} document
                                    {documents.length > 1
                                        ? "s"
                                        : ""}{" "}
                                    processed
                                </p>
                            </div>

                            <div className="document-count">
                                {documents.length}
                            </div>

                        </div>

                        <div className="document-list">

                            {documents.map(
                                (document) => (
                                    <div
                                        className="document-item"
                                        key={
                                            document._id
                                        }
                                    >

                                        <div className="document-type">
                                            {document.mimeType ===
                                            "application/pdf"
                                                ? "PDF"
                                                : "IMG"}
                                        </div>

                                        <div className="document-details">

                                            <strong>
                                                {
                                                    document.originalName
                                                }
                                            </strong>

                                            <span>
                                                Uploaded{" "}
                                                {formatDate(
                                                    document.createdAt
                                                )}
                                            </span>

                                        </div>

                                        <div className="document-status">

                                            {document.aiAnalysisCompleted ? (
                                                <>
                                                    <span>
                                                        ✓
                                                    </span>
                                                    AI analyzed
                                                </>
                                            ) : document.ocrCompleted ? (
                                                <>
                                                    <span>
                                                        ✓
                                                    </span>
                                                    Text extracted
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        •
                                                    </span>
                                                    Uploaded
                                                </>
                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </section>
                )}

                {/* ==================================
                    FINISH
                ================================== */}

                <div className="finish-area">

                    <div className="finish-note">

                        <span>👨‍⚕️</span>

                        <p>
                            Your uploaded information will be
                            available to the doctor for review.
                            AI-generated documentation does not
                            replace clinical judgment.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="finish-button"
                        onClick={handleFinish}
                    >
                        Finish
                        <span>✓</span>
                    </button>

                </div>

            </main>

            {/* FOOTER */}

            <footer className="documents-footer">
                MediKiosk • AI-assisted medical documentation
                • Doctor verification required
            </footer>

            {/* ======================================
                STYLES
            ====================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .documents-page {
                    min-height: 100vh;
                    background:
                        radial-gradient(
                            circle at 10% 10%,
                            rgba(
                                37,
                                99,
                                235,
                                0.07
                            ),
                            transparent 25%
                        ),
                        radial-gradient(
                            circle at 90% 20%,
                            rgba(
                                13,
                                148,
                                136,
                                0.07
                            ),
                            transparent 25%
                        ),
                        #f6f9fc;
                    color: #172033;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* NAVBAR */

                .documents-navbar {
                    height: 74px;
                    padding: 0 6%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.93
                    );
                    border-bottom: 1px solid #e4eaf0;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    backdrop-filter: blur(14px);
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .brand-logo {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background:
                        linear-gradient(
                            135deg,
                            #2563eb,
                            #0f766e
                        );
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 27px;
                    font-weight: 300;
                    box-shadow:
                        0 7px 18px
                        rgba(
                            37,
                            99,
                            235,
                            0.20
                        );
                }

                .brand strong,
                .brand span {
                    display: block;
                }

                .brand strong {
                    font-size: 18px;
                    letter-spacing: -0.4px;
                }

                .brand span {
                    color: #8792a1;
                    font-size: 10px;
                    margin-top: 1px;
                }

                .navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .patient-name {
                    font-size: 12px;
                    color: #596678;
                }

                .language-pill {
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: white;
                    border: 1px solid #dce5ed;
                    color: #536174;
                    font-size: 11px;
                    font-weight: 600;
                }

                /* CONTAINER */

                .documents-container {
                    width: min(
                        850px,
                        92%
                    );
                    margin: auto;
                    flex: 1;
                    padding: 55px 0 40px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 20px;
                }

                .small-label {
                    color: #2563eb;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.3px;
                    margin-bottom: 9px;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 34px;
                    line-height: 1.15;
                    letter-spacing: -1.3px;
                }

                .page-header p {
                    margin: 9px 0 0;
                    color: #7c8796;
                    font-size: 13px;
                    line-height: 1.6;
                    max-width: 620px;
                }

                .step-badge {
                    background: #eff6ff;
                    border: 1px solid #dcecff;
                    color: #64748b;
                    padding: 9px 12px;
                    border-radius: 10px;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .step-badge span {
                    color: #2563eb;
                    font-weight: 800;
                }

                /* PROGRESS */

                .step-progress {
                    margin-top: 32px;
                }

                .progress-line {
                    width: 100%;
                    height: 5px;
                    background: #e5ebf1;
                    border-radius: 999px;
                    overflow: hidden;
                }

                .progress-done {
                    width: 66%;
                    height: 100%;
                    border-radius: inherit;
                    background:
                        linear-gradient(
                            90deg,
                            #2563eb,
                            #0f766e
                        );
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    color: #9aa4b1;
                    font-size: 9px;
                }

                .progress-labels .done {
                    color: #15803d;
                }

                .progress-labels .active {
                    color: #2563eb;
                    font-weight: 700;
                }

                /* UPLOAD CARD */

                .upload-card {
                    background: white;
                    border: 1px solid #e1e8ef;
                    border-radius: 22px;
                    padding: 27px;
                    margin-top: 27px;
                    box-shadow:
                        0 20px 55px
                        rgba(
                            31,
                            55,
                            80,
                            0.08
                        );
                }

                .upload-card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .upload-card-header h2 {
                    margin: 0;
                    font-size: 18px;
                    letter-spacing: -0.4px;
                }

                .upload-card-header p {
                    margin: 5px 0 0;
                    color: #8994a2;
                    font-size: 10px;
                }

                .supported-icons {
                    display: flex;
                    gap: 5px;
                }

                .supported-icons span {
                    padding: 5px 7px;
                    background: #f5f7fa;
                    border: 1px solid #e7ebef;
                    border-radius: 5px;
                    color: #8994a2;
                    font-size: 8px;
                    font-weight: 800;
                }

                /* DROP ZONE */

                .drop-zone {
                    min-height: 245px;
                    border: 1.5px dashed #cbd8e4;
                    border-radius: 16px;
                    background: #fbfdff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .drop-zone:hover,
                .drop-zone.dragging {
                    border-color: #5d8fe5;
                    background: #f5f9ff;
                }

                .upload-icon {
                    width: 58px;
                    height: 58px;
                    border-radius: 17px;
                    background: #edf5ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 27px;
                    margin-bottom: 15px;
                    font-weight: 500;
                }

                .drop-zone h3 {
                    margin: 0;
                    font-size: 14px;
                }

                .drop-zone p {
                    color: #929daa;
                    font-size: 11px;
                    margin: 7px 0;
                }

                .drop-zone p span {
                    color: #2563eb;
                    font-weight: 700;
                }

                .drop-zone small {
                    color: #adb5bf;
                    font-size: 9px;
                }

                /* FILE */

                .selected-file {
                    min-height: 100px;
                    border: 1px solid #dce7f2;
                    background: #f8fbff;
                    border-radius: 14px;
                    padding: 17px;
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }

                .file-icon {
                    width: 47px;
                    height: 47px;
                    border-radius: 12px;
                    background: #edf5ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 900;
                }

                .file-info {
                    flex: 1;
                    min-width: 0;
                }

                .file-info strong,
                .file-info span {
                    display: block;
                }

                .file-info strong {
                    font-size: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .file-info span {
                    color: #929daa;
                    font-size: 9px;
                    margin-top: 4px;
                }

                .remove-file {
                    width: 29px;
                    height: 29px;
                    border-radius: 8px;
                    border: 1px solid #e1e6eb;
                    background: white;
                    color: #8b96a3;
                    cursor: pointer;
                    font-size: 18px;
                }

                .remove-file:hover {
                    color: #dc2626;
                    border-color: #f0caca;
                }

                /* PROCESSING */

                .processing-box {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    padding: 15px;
                    margin-top: 15px;
                    border-radius: 12px;
                    background: #f1f7ff;
                    border: 1px solid #dcecff;
                }

                .processing-spinner {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .processing-spinner span {
                    width: 17px;
                    height: 17px;
                    border-radius: 50%;
                    border: 2px solid #d9e6fa;
                    border-top-color: #2563eb;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .processing-box strong {
                    display: block;
                    font-size: 11px;
                }

                .processing-box p {
                    margin: 3px 0 0;
                    color: #7c8998;
                    font-size: 9px;
                }

                /* MESSAGE */

                .message {
                    margin-top: 15px;
                    border-radius: 10px;
                    padding: 11px 13px;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    font-size: 10px;
                }

                .message.success {
                    background: #effaf3;
                    border: 1px solid #d3efdc;
                    color: #257343;
                }

                .message.error {
                    background: #fff5f5;
                    border: 1px solid #ffdcdc;
                    color: #c24141;
                }

                .message.info {
                    background: #f1f7ff;
                    border: 1px solid #dcecff;
                    color: #315f9f;
                }

                .message > span {
                    font-weight: 800;
                }

                /* BUTTON */

                .upload-button {
                    width: 100%;
                    margin-top: 17px;
                    border: none;
                    border-radius: 10px;
                    padding: 14px;
                    background:
                        linear-gradient(
                            135deg,
                            #2563eb,
                            #1d4ed8
                        );
                    color: white;
                    font-size: 11px;
                    font-weight: 750;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow:
                        0 8px 18px
                        rgba(
                            37,
                            99,
                            235,
                            0.18
                        );
                }

                .upload-button:hover {
                    transform: translateY(-1px);
                }

                .upload-button span {
                    font-size: 15px;
                }

                /* AI SECTION */

                .ai-section {
                    margin-top: 20px;
                    background: #f8fbff;
                    border: 1px solid #e0eaf5;
                    border-radius: 18px;
                    padding: 23px;
                }

                .ai-section-header {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .ai-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: #e9f2ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 17px;
                }

                .ai-section-header h2 {
                    margin: 0;
                    font-size: 14px;
                }

                .ai-section-header p {
                    margin: 4px 0 0;
                    color: #8994a2;
                    font-size: 9px;
                }

                .ai-process {
                    display: flex;
                    align-items: center;
                    margin-top: 22px;
                }

                .process-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 9px;
                    flex: 1;
                }

                .process-number {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: white;
                    border: 1px solid #dce6ef;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .process-item strong,
                .process-item span {
                    display: block;
                }

                .process-item strong {
                    font-size: 10px;
                }

                .process-item span {
                    color: #929daa;
                    font-size: 8px;
                    line-height: 1.4;
                    margin-top: 3px;
                }

                .process-connector {
                    width: 25px;
                    height: 1px;
                    background: #d8e2ec;
                    flex-shrink: 0;
                    margin: 13px 8px 0;
                }

                /* DOCUMENTS */

                .uploaded-section {
                    margin-top: 28px;
                }

                .section-heading {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .section-heading h2 {
                    margin: 0;
                    font-size: 17px;
                }

                .section-heading p {
                    margin: 4px 0 0;
                    color: #929daa;
                    font-size: 9px;
                }

                .document-count {
                    width: 30px;
                    height: 30px;
                    border-radius: 9px;
                    background: #edf5ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 800;
                }

                .document-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .document-item {
                    background: white;
                    border: 1px solid #e2e8ee;
                    border-radius: 13px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .document-type {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #f3f6fa;
                    color: #687587;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: 900;
                }

                .document-details {
                    flex: 1;
                    min-width: 0;
                }

                .document-details strong,
                .document-details span {
                    display: block;
                }

                .document-details strong {
                    font-size: 11px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .document-details span {
                    color: #98a2af;
                    font-size: 8px;
                    margin-top: 3px;
                }

                .document-status {
                    color: #15803d;
                    font-size: 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                }

                .document-status span {
                    font-weight: 800;
                }

                /* FINISH */

                .finish-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-top: 30px;
                    padding-top: 23px;
                    border-top: 1px solid #e4eaf0;
                }

                .finish-note {
                    display: flex;
                    gap: 9px;
                    align-items: flex-start;
                    color: #8994a2;
                }

                .finish-note span {
                    font-size: 15px;
                }

                .finish-note p {
                    margin: 0;
                    max-width: 480px;
                    font-size: 9px;
                    line-height: 1.5;
                }

                .finish-button {
                    border: 1px solid #dce5ed;
                    background: white;
                    color: #344054;
                    padding: 11px 18px;
                    border-radius: 9px;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }

                .finish-button:hover {
                    border-color: #9db8dc;
                    color: #2563eb;
                }

                /* FOOTER */

                .documents-footer {
                    text-align: center;
                    color: #a0a9b5;
                    font-size: 9px;
                    padding: 20px;
                }

                /* RESPONSIVE */

                @media (max-width: 700px) {

                    .documents-navbar {
                        padding: 0 5%;
                    }

                    .patient-name {
                        display: none;
                    }

                    .documents-container {
                        width: 90%;
                        padding-top: 35px;
                    }

                    .page-header h1 {
                        font-size: 28px;
                    }

                    .upload-card {
                        padding: 20px;
                    }

                    .supported-icons {
                        display: none;
                    }

                    .ai-process {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .process-connector {
                        display: none;
                    }

                    .finish-area {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .finish-button {
                        justify-content: center;
                    }

                    .document-status {
                        display: none;
                    }

                    .progress-labels {
                        font-size: 7px;
                    }
                }

            `}</style>
        </div>
    );
}

export default MedicalDocumentUpload;