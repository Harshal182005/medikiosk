import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

function DoctorDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        completedInterviews: 0,
        pendingInterviews: 0
    });

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [combinedSummary, setCombinedSummary] = useState("");
    const [redFlags, setRedFlags] = useState([]);
    const [redFlagCompleted, setRedFlagCompleted] = useState(false);

    const [loading, setLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [combinedSummaryLoading, setCombinedSummaryLoading] =
        useState(false);
    const [redFlagLoading, setRedFlagLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    const [doctorNotes, setDoctorNotes] = useState("");
    const [verificationStatus, setVerificationStatus] =
        useState("Pending");
    const [verificationLoading, setVerificationLoading] =
        useState(false);
    const [verificationMessage, setVerificationMessage] =
        useState("");

    // =====================================================
    // LOAD STATS
    // =====================================================

    const loadStats = async () => {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/doctors/stats`
            );

            if (response.data.success) {
                setStats(
                    response.data.stats || {
                        totalPatients: 0,
                        completedInterviews: 0,
                        pendingInterviews: 0
                    }
                );
            }
        } catch (error) {
            console.error("Stats error:", error);

            setMessage(
                error.response?.data?.message ||
                    "Failed to load dashboard statistics."
            );
        }
    };

    // =====================================================
    // LOAD PATIENTS
    // =====================================================

    const loadPatients = async () => {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/doctors/patients`
            );

            if (response.data.success) {
                setPatients(response.data.patients || []);
            } else {
                setPatients([]);
            }
        } catch (error) {
            console.error("Patients error:", error);

            setMessage(
                error.response?.data?.message ||
                    "Failed to load patients."
            );
        }
    };

    // =====================================================
    // LOAD PATIENT DETAILS
    // =====================================================

    const loadPatientDetails = async (patientId) => {
        try {
            setPatientLoading(true);
            setMessage("");
            setVerificationMessage("");

            const response = await axios.get(
                `${BACKEND_URL}/api/doctors/patients/${patientId}`
            );

            if (response.data.success) {
                const patient = response.data.patient;

                setSelectedPatient(patient);

                setDoctorNotes(
                    patient.doctorVerification?.notes || ""
                );

                setVerificationStatus(
                    patient.doctorVerification?.status || "Pending"
                );

                setCombinedSummary(
                    patient.combinedAISummary || ""
                );

                setRedFlags(patient.redFlags || []);

                setRedFlagCompleted(
                    patient.redFlagAnalysisCompleted || false
                );
            }
        } catch (error) {
            console.error("Patient details error:", error);

            setMessage(
                error.response?.data?.message ||
                    "Failed to load patient details."
            );
        } finally {
            setPatientLoading(false);
        }
    };

    // =====================================================
    // LOAD DOCUMENTS
    // =====================================================

    const loadPatientDocuments = async (patientId) => {
        try {
            setDocumentsLoading(true);

            const response = await axios.get(
                `${BACKEND_URL}/api/documents/patient/${patientId}`
            );

            if (response.data.success) {
                setDocuments(
                    response.data.documents || []
                );
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Documents error:", error);
            setDocuments([]);
        } finally {
            setDocumentsLoading(false);
        }
    };

    // =====================================================
    // SELECT PATIENT
    // =====================================================

    const handlePatientSelect = async (patientId) => {
        setDocuments([]);
        setCombinedSummary("");
        setRedFlags([]);
        setRedFlagCompleted(false);
        setVerificationMessage("");

        await Promise.all([
            loadPatientDetails(patientId),
            loadPatientDocuments(patientId)
        ]);
    };

    // =====================================================
    // COMBINED AI SUMMARY
    // =====================================================

    const generateCombinedSummary = async () => {
        if (!selectedPatient?._id) {
            setMessage("Please select a patient first.");
            return;
        }

        try {
            setCombinedSummaryLoading(true);
            setMessage("");

            const response = await axios.post(
                `${BACKEND_URL}/api/combined-ai/generate-summary`,
                {
                    patientId: selectedPatient._id
                }
            );

            if (response.data.success) {
                const summary =
                    response.data.summary || "";

                setCombinedSummary(summary);

                setSelectedPatient((previous) => {
                    if (!previous) return previous;

                    return {
                        ...previous,
                        combinedAISummary: summary
                    };
                });

                setMessage(
                    "Combined AI summary generated successfully."
                );
            } else {
                setMessage(
                    response.data.message ||
                        "Failed to generate combined AI summary."
                );
            }
        } catch (error) {
            console.error(
                "Combined summary error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Failed to generate combined AI summary."
            );
        } finally {
            setCombinedSummaryLoading(false);
        }
    };

    // =====================================================
    // AI ATTENTION INDICATORS
    // =====================================================

    const generateRedFlags = async () => {
        if (!selectedPatient?._id) {
            setMessage("Please select a patient first.");
            return;
        }

        try {
            setRedFlagLoading(true);
            setMessage("");

            const response = await axios.post(
                `${BACKEND_URL}/api/red-flags/generate`,
                {
                    patientId: selectedPatient._id
                }
            );

            if (response.data.success) {
                const flags =
                    response.data.redFlags || [];

                setRedFlags(flags);
                setRedFlagCompleted(true);

                setSelectedPatient((previous) => {
                    if (!previous) return previous;

                    return {
                        ...previous,
                        redFlags: flags,
                        redFlagAnalysisCompleted: true
                    };
                });

                setMessage(
                    "AI attention-indicator analysis completed."
                );
            } else {
                setMessage(
                    response.data.message ||
                        "Failed to generate AI attention indicators."
                );
            }
        } catch (error) {
            console.error("Red flag error:", error);

            setMessage(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Failed to generate AI attention indicators."
            );
        } finally {
            setRedFlagLoading(false);
        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!search.trim()) {
            await loadPatients();
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.get(
                `${BACKEND_URL}/api/doctors/search`,
                {
                    params: {
                        query: search.trim()
                    }
                }
            );

            if (response.data.success) {
                setPatients(
                    response.data.patients || []
                );
            } else {
                setPatients([]);
            }
        } catch (error) {
            console.error("Search error:", error);

            setMessage(
                error.response?.data?.message ||
                    "Patient search failed."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // VERIFY PATIENT
    // =====================================================

    const verifyPatientCase = async () => {
        if (!selectedPatient) {
            setVerificationMessage(
                "Please select a patient first."
            );
            return;
        }

        try {
            setVerificationLoading(true);
            setVerificationMessage("");

            const response = await axios.put(
                `${BACKEND_URL}/api/doctors/patients/${selectedPatient._id}/verify`,
                {
                    notes: doctorNotes
                }
            );

            if (response.data?.success) {
                setVerificationStatus("Reviewed");

                setVerificationMessage(
                    "Patient case marked as reviewed successfully."
                );

                await loadPatientDetails(
                    selectedPatient._id
                );
            }
        } catch (error) {
            console.error(
                "Verification error:",
                error
            );

            setVerificationMessage(
                error.response?.data?.message ||
                    "Failed to verify patient case."
            );
        } finally {
            setVerificationLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);

            await Promise.all([
                loadStats(),
                loadPatients()
            ]);

            setLoading(false);
        };

        loadDashboard();
    }, []);

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "Not available";

        const formattedDate = new Date(date);

        if (
            Number.isNaN(
                formattedDate.getTime()
            )
        ) {
            return "Not available";
        }

        return formattedDate.toLocaleString();
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="dashboard">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                <div className="brand">
                    <div className="brandIcon">
                        ✚
                    </div>

                    <div>
                        <h2>MediKiosk</h2>
                        <span>Clinical Workspace</span>
                    </div>
                </div>

                <div className="sidebarSection">
                    <p className="sidebarLabel">
                        WORKSPACE
                    </p>

                    <div className="sideItem active">
                        <span>▦</span>
                        Dashboard
                    </div>

                    <div className="sideItem">
                        <span>♙</span>
                        Patients
                    </div>

                    <div className="sideItem">
                        <span>▤</span>
                        Medical Records
                    </div>

                    <div className="sideItem">
                        <span>◉</span>
                        AI Analysis
                    </div>
                </div>

                <div className="sidebarBottom">
                    <div className="doctorProfile">
                        <div className="doctorAvatar">
                            DR
                        </div>

                        <div>
                            <strong>Doctor Portal</strong>
                            <span>MediKiosk</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* =================================================
                MAIN AREA
            ================================================= */}

            <main className="main">

                {/* TOP BAR */}

                <header className="topbar">

                    <div>
                        <p className="eyebrow">
                            CLINICAL DASHBOARD
                        </p>

                        <h1>
                            Good to see you, Doctor
                        </h1>

                        <p className="subtitle">
                            Review patient information and
                            AI-assisted documentation.
                        </p>
                    </div>

                    <div className="topActions">
                        <div className="statusPill">
                            <span className="statusDot"></span>
                            System Online
                        </div>

                        <button
                            className="refreshBtn"
                            onClick={async () => {
                                setLoading(true);

                                await Promise.all([
                                    loadStats(),
                                    loadPatients()
                                ]);

                                setLoading(false);
                            }}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </header>

                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (
                    <div className="message">
                        <span>ⓘ</span>
                        {message}
                        <button
                            onClick={() =>
                                setMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* =================================================
                    STATS
                ================================================= */}

                <section className="statsGrid">

                    <div className="statCard">
                        <div className="statIcon blue">
                            ♙
                        </div>

                        <div>
                            <span>Total Patients</span>
                            <strong>
                                {stats.totalPatients ?? 0}
                            </strong>
                            <small>
                                Registered patients
                            </small>
                        </div>
                    </div>

                    <div className="statCard">
                        <div className="statIcon green">
                            ✓
                        </div>

                        <div>
                            <span>Completed Interviews</span>
                            <strong>
                                {stats.completedInterviews ?? 0}
                            </strong>
                            <small>
                                Ready for review
                            </small>
                        </div>
                    </div>

                    <div className="statCard">
                        <div className="statIcon orange">
                            ◷
                        </div>

                        <div>
                            <span>Pending Interviews</span>
                            <strong>
                                {stats.pendingInterviews ?? 0}
                            </strong>
                            <small>
                                Awaiting completion
                            </small>
                        </div>
                    </div>

                    <div className="statCard">
                        <div className="statIcon purple">
                            ✦
                        </div>

                        <div>
                            <span>AI Documentation</span>
                            <strong>
                                AI
                            </strong>
                            <small>
                                Assisted workflow
                            </small>
                        </div>
                    </div>

                </section>

                {/* =================================================
                    SEARCH
                ================================================= */}

                <section className="searchCard">

                    <div className="searchHeading">
                        <div>
                            <h3>
                                Patient Records
                            </h3>

                            <p>
                                Search and review patient cases
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="searchForm"
                    >
                        <div className="searchInput">
                            <span>⌕</span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by patient name or phone number..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="primaryBtn"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            className="secondaryBtn"
                            onClick={() => {
                                setSearch("");
                                loadPatients();
                            }}
                        >
                            Clear
                        </button>
                    </form>

                </section>

                {/* =================================================
                    PATIENT WORKSPACE
                ================================================= */}

                <section className="workspace">

                    {/* PATIENT LIST */}

                    <div className="patientPanel">

                        <div className="panelHeader">
                            <div>
                                <h3>Patients</h3>
                                <span>
                                    {patients.length} records
                                </span>
                            </div>
                        </div>

                        <div className="patientList">

                            {loading ? (
                                <div className="emptyState">
                                    <div className="loader"></div>
                                    <p>
                                        Loading patient records...
                                    </p>
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="emptyState">
                                    <div className="emptyIcon">
                                        ♙
                                    </div>

                                    <strong>
                                        No patients found
                                    </strong>

                                    <p>
                                        Patient records will
                                        appear here.
                                    </p>
                                </div>
                            ) : (
                                patients.map((patient) => (
                                    <button
                                        key={patient._id}
                                        className={`patientItem ${
                                            selectedPatient?._id ===
                                            patient._id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handlePatientSelect(
                                                patient._id
                                            )
                                        }
                                    >
                                        <div className="patientAvatar">
                                            {patient.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "P"}
                                        </div>

                                        <div className="patientInfo">
                                            <strong>
                                                {patient.name}
                                            </strong>

                                            <span>
                                                {patient.age} years
                                                {" • "}
                                                {patient.gender}
                                            </span>

                                            <small>
                                                {patient.phone}
                                            </small>
                                        </div>

                                        <span className="arrow">
                                            ›
                                        </span>
                                    </button>
                                ))
                            )}

                        </div>
                    </div>

                    {/* PATIENT DETAILS */}

                    <div className="detailsPanel">

                        {!selectedPatient ? (
                            <div className="welcomePanel">

                                <div className="welcomeIcon">
                                    ✚
                                </div>

                                <h2>
                                    Select a patient
                                </h2>

                                <p>
                                    Choose a patient from the
                                    records list to view their
                                    complete case information,
                                    interview, documents and
                                    AI-assisted analysis.
                                </p>

                                <div className="workflowMini">

                                    <div>
                                        <span>1</span>
                                        Patient
                                    </div>

                                    <div className="line"></div>

                                    <div>
                                        <span>2</span>
                                        Interview
                                    </div>

                                    <div className="line"></div>

                                    <div>
                                        <span>3</span>
                                        Documents
                                    </div>

                                    <div className="line"></div>

                                    <div>
                                        <span>4</span>
                                        Review
                                    </div>

                                </div>

                            </div>
                        ) : patientLoading ? (
                            <div className="welcomePanel">
                                <div className="loader"></div>

                                <h2>
                                    Loading patient case...
                                </h2>

                                <p>
                                    Preparing the complete
                                    patient record.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* PATIENT HEADER */}

                                <div className="patientHero">

                                    <div className="largeAvatar">
                                        {selectedPatient.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "P"}
                                    </div>

                                    <div className="heroInfo">
                                        <span className="caseLabel">
                                            PATIENT CASE
                                        </span>

                                        <h2>
                                            {selectedPatient.name}
                                        </h2>

                                        <p>
                                            {selectedPatient.age} years
                                            {" • "}
                                            {selectedPatient.gender}
                                            {" • "}
                                            {selectedPatient.phone}
                                        </p>

                                        <div className="heroTags">
                                            <span>
                                                🌐{" "}
                                                {selectedPatient.preferredLanguage ||
                                                    "English"}
                                            </span>

                                            <span>
                                                Registered{" "}
                                                {formatDate(
                                                    selectedPatient.createdAt
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className={`reviewBadge ${
                                            verificationStatus ===
                                            "Reviewed"
                                                ? "reviewed"
                                                : ""
                                        }`}
                                    >
                                        {verificationStatus ===
                                        "Reviewed"
                                            ? "✓ Reviewed"
                                            : "◷ Pending Review"}
                                    </div>

                                </div>

                                {/* QUICK INFORMATION */}

                                <div className="infoGrid">

                                    <div className="infoCard">
                                        <span>Medical History</span>
                                        <strong>
                                            {selectedPatient
                                                .medicalHistory
                                                ? "Available"
                                                : "Not provided"}
                                        </strong>
                                    </div>

                                    <div className="infoCard">
                                        <span>Interview</span>
                                        <strong>
                                            {selectedPatient
                                                .interview
                                                ?.completed
                                                ? "✓ Completed"
                                                : "◷ Pending"}
                                        </strong>
                                    </div>

                                    <div className="infoCard">
                                        <span>Documents</span>
                                        <strong>
                                            {documents.length}
                                        </strong>
                                    </div>

                                    <div className="infoCard">
                                        <span>AI Analysis</span>
                                        <strong>
                                            {combinedSummary
                                                ? "Available"
                                                : "Not generated"}
                                        </strong>
                                    </div>

                                </div>

                                {/* AI SUMMARY */}

                                <div className="sectionCard aiSection">

                                    <div className="sectionHeader">

                                        <div className="sectionTitle">
                                            <div className="sectionIcon ai">
                                                ✦
                                            </div>

                                            <div>
                                                <h3>
                                                    Combined AI Summary
                                                </h3>

                                                <p>
                                                    Consolidated
                                                    documentation from
                                                    registration,
                                                    interview and
                                                    medical documents.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            className="aiButton"
                                            onClick={
                                                generateCombinedSummary
                                            }
                                            disabled={
                                                combinedSummaryLoading
                                            }
                                        >
                                            {combinedSummaryLoading
                                                ? "Generating..."
                                                : combinedSummary
                                                ? "↻ Refresh Summary"
                                                : "✦ Generate Summary"}
                                        </button>

                                    </div>

                                    {combinedSummary ? (
                                        <div className="aiContent">
                                            <pre>
                                                {
                                                    combinedSummary
                                                }
                                            </pre>

                                            <div className="warningBox">
                                                <span>⚠</span>

                                                <div>
                                                    <strong>
                                                        Doctor verification
                                                        required
                                                    </strong>

                                                    <p>
                                                        This is an
                                                        AI-generated
                                                        documentation
                                                        draft. Verify all
                                                        information
                                                        against patient
                                                        responses and
                                                        original medical
                                                        documents.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="notGenerated">
                                            <span>✦</span>

                                            <p>
                                                No combined AI summary
                                                has been generated yet.
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* ATTENTION INDICATORS */}

                                <div className="sectionCard">

                                    <div className="sectionHeader">

                                        <div className="sectionTitle">
                                            <div className="sectionIcon attention">
                                                !
                                            </div>

                                            <div>
                                                <h3>
                                                    AI Attention Indicators
                                                </h3>

                                                <p>
                                                    Information that may
                                                    require additional
                                                    doctor review.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            className="attentionButton"
                                            onClick={
                                                generateRedFlags
                                            }
                                            disabled={
                                                redFlagLoading
                                            }
                                        >
                                            {redFlagLoading
                                                ? "Analyzing..."
                                                : redFlagCompleted
                                                ? "↻ Refresh Analysis"
                                                : "! Analyze Case"}
                                        </button>

                                    </div>

                                    {redFlags.length > 0 ? (
                                        <div className="flagList">

                                            {redFlags.map(
                                                (
                                                    flag,
                                                    index
                                                ) => (
                                                    <div
                                                        className="flagCard"
                                                        key={index}
                                                    >
                                                        <div className="flagTop">
                                                            <span className="flagIcon">
                                                                !
                                                            </span>

                                                            <strong>
                                                                {flag.category ||
                                                                    "Doctor Review"}
                                                            </strong>
                                                        </div>

                                                        <div className="flagDetails">

                                                            <p>
                                                                <b>
                                                                    Finding
                                                                </b>

                                                                {flag.finding ||
                                                                    "Not specified"}
                                                            </p>

                                                            <p>
                                                                <b>
                                                                    Source
                                                                </b>

                                                                {flag.source ||
                                                                    "Not specified"}
                                                            </p>

                                                            <p>
                                                                <b>
                                                                    Reason
                                                                </b>

                                                                {flag.reason ||
                                                                    "Not specified"}
                                                            </p>

                                                        </div>
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    ) : (
                                        <div className="notGenerated">
                                            <span>
                                                {redFlagCompleted
                                                    ? "✓"
                                                    : "!"}
                                            </span>

                                            <p>
                                                {redFlagCompleted
                                                    ? "No AI attention indicators were identified from the available information."
                                                    : "AI attention-indicator analysis has not been performed yet."}
                                            </p>
                                        </div>
                                    )}

                                    <div className="smallWarning">
                                        ⚠ These indicators are not
                                        diagnoses. Doctor review is
                                        required.
                                    </div>

                                </div>

                                {/* MEDICAL INFORMATION */}

                                <div className="sectionCard">

                                    <div className="sectionHeader">
                                        <div className="sectionTitle">
                                            <div className="sectionIcon medical">
                                                +
                                            </div>

                                            <div>
                                                <h3>
                                                    Medical Information
                                                </h3>

                                                <p>
                                                    Patient-provided
                                                    medical information.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="medicalGrid">

                                        <div>
                                            <label>
                                                Medical History
                                            </label>

                                            <p>
                                                {selectedPatient
                                                    .medicalHistory ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                        <div>
                                            <label>
                                                Allergies
                                            </label>

                                            <p>
                                                {selectedPatient
                                                    .allergies ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                        <div>
                                            <label>
                                                Current Medications
                                            </label>

                                            <p>
                                                {selectedPatient
                                                    .currentMedications ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                        <div>
                                            <label>
                                                Symptoms
                                            </label>

                                            <p>
                                                {selectedPatient
                                                    .symptoms ||
                                                    "Not provided"}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* INTERVIEW */}

                                <div className="sectionCard">

                                    <div className="sectionHeader">

                                        <div className="sectionTitle">
                                            <div className="sectionIcon interview">
                                                ☷
                                            </div>

                                            <div>
                                                <h3>
                                                    Patient Interview
                                                </h3>

                                                <p>
                                                    Answers collected
                                                    during the AI-assisted
                                                    interview.
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`statusTag ${
                                                selectedPatient
                                                    .interview
                                                    ?.completed
                                                    ? "complete"
                                                    : "pending"
                                            }`}
                                        >
                                            {selectedPatient
                                                .interview
                                                ?.completed
                                                ? "✓ Completed"
                                                : "◷ Pending"}
                                        </span>

                                    </div>

                                    {selectedPatient
                                        .interview
                                        ?.answers?.length > 0 ? (
                                        <div className="interviewList">

                                            {selectedPatient.interview.answers.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        className="questionCard"
                                                        key={index}
                                                    >
                                                        <span>
                                                            Q
                                                            {index + 1}
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    item.question
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    item.answer
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    ) : (
                                        <div className="notGenerated">
                                            <span>☷</span>

                                            <p>
                                                No interview answers
                                                available.
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* DOCUMENTS */}

                                <div className="sectionCard">

                                    <div className="sectionHeader">

                                        <div className="sectionTitle">
                                            <div className="sectionIcon document">
                                                ▤
                                            </div>

                                            <div>
                                                <h3>
                                                    Medical Documents
                                                </h3>

                                                <p>
                                                    Uploaded medical
                                                    records and AI
                                                    extraction results.
                                                </p>
                                            </div>
                                        </div>

                                        <span className="documentCount">
                                            {documents.length}{" "}
                                            documents
                                        </span>

                                    </div>

                                    {documentsLoading ? (
                                        <div className="notGenerated">
                                            <div className="loader"></div>

                                            <p>
                                                Loading documents...
                                            </p>
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="notGenerated">
                                            <span>▤</span>

                                            <p>
                                                No medical documents
                                                uploaded by this patient.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="documentsList">

                                            {documents.map(
                                                (
                                                    document
                                                ) => (
                                                    <div
                                                        className="documentCard"
                                                        key={
                                                            document._id
                                                        }
                                                    >

                                                        <div className="documentHeader">

                                                            <div className="fileIcon">
                                                                ▤
                                                            </div>

                                                            <div>
                                                                <h4>
                                                                    {
                                                                        document.originalName
                                                                    }
                                                                </h4>

                                                                <span>
                                                                    Uploaded{" "}
                                                                    {formatDate(
                                                                        document.createdAt
                                                                    )}
                                                                </span>
                                                            </div>

                                                        </div>

                                                        <div className="documentStatus">

                                                            <span
                                                                className={
                                                                    document.ocrCompleted
                                                                        ? "successTag"
                                                                        : "failedTag"
                                                                }
                                                            >
                                                                {document.ocrCompleted
                                                                    ? "✓ OCR Completed"
                                                                    : "× OCR Not Completed"}
                                                            </span>

                                                            <span
                                                                className={
                                                                    document.aiAnalysisCompleted
                                                                        ? "successTag"
                                                                        : "failedTag"
                                                                }
                                                            >
                                                                {document.aiAnalysisCompleted
                                                                    ? "✓ AI Analysis Completed"
                                                                    : "× AI Analysis Not Completed"}
                                                            </span>

                                                        </div>

                                                        <div className="documentBlock">

                                                            <h5>
                                                                🔍 OCR /
                                                                Extracted Text
                                                            </h5>

                                                            <pre>
                                                                {document.extractedText ||
                                                                    "No text extracted."}
                                                            </pre>

                                                        </div>

                                                        <div className="documentBlock aiDoc">

                                                            <h5>
                                                                ✦ AI Document
                                                                Analysis
                                                            </h5>

                                                            <pre>
                                                                {document.aiSummary ||
                                                                    "AI analysis not available."}
                                                            </pre>

                                                        </div>

                                                        <div className="smallWarning">
                                                            ⚠ AI-extracted
                                                            information must
                                                            be verified against
                                                            the original medical
                                                            document.
                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>

                                {/* INTERVIEW AI SUMMARY */}

                                <div className="sectionCard">

                                    <div className="sectionHeader">

                                        <div className="sectionTitle">
                                            <div className="sectionIcon ai">
                                                ✦
                                            </div>

                                            <div>
                                                <h3>
                                                    AI Interview Summary
                                                </h3>

                                                <p>
                                                    Documentation generated
                                                    from the patient
                                                    interview.
                                                </p>
                                            </div>
                                        </div>

                                    </div>

                                    {selectedPatient.aiSummary ? (
                                        <>
                                            <div className="aiContent">
                                                <pre>
                                                    {
                                                        selectedPatient.aiSummary
                                                    }
                                                </pre>
                                            </div>

                                            <div className="warningBox">
                                                <span>⚠</span>

                                                <div>
                                                    <strong>
                                                        Doctor verification
                                                        required
                                                    </strong>

                                                    <p>
                                                        This is an
                                                        AI-generated
                                                        documentation draft.
                                                        Verify before clinical
                                                        decisions.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="notGenerated">
                                            <span>✦</span>

                                            <p>
                                                AI interview summary is
                                                not available.
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* DOCTOR VERIFICATION */}

                                <div className="verificationCard">

                                    <div className="verificationHeader">

                                        <div>
                                            <span className="caseLabel">
                                                FINAL REVIEW
                                            </span>

                                            <h3>
                                                Doctor Verification
                                            </h3>

                                            <p>
                                                Review the complete case
                                                before marking it as
                                                reviewed.
                                            </p>
                                        </div>

                                        <div
                                            className={`verificationStatus ${
                                                verificationStatus ===
                                                "Reviewed"
                                                    ? "reviewed"
                                                    : ""
                                            }`}
                                        >
                                            {verificationStatus ===
                                            "Reviewed"
                                                ? "✓ Review Completed"
                                                : "◷ Pending Review"}
                                        </div>

                                    </div>

                                    <label>
                                        Doctor Notes
                                    </label>

                                    <textarea
                                        value={doctorNotes}
                                        onChange={(e) =>
                                            setDoctorNotes(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your verification notes..."
                                        rows="6"
                                    />

                                    <button
                                        type="button"
                                        className={`verifyButton ${
                                            verificationStatus ===
                                            "Reviewed"
                                                ? "reviewed"
                                                : ""
                                        }`}
                                        onClick={
                                            verifyPatientCase
                                        }
                                        disabled={
                                            verificationLoading
                                        }
                                    >
                                        {verificationLoading
                                            ? "Saving Review..."
                                            : verificationStatus ===
                                              "Reviewed"
                                            ? "✓ Update Doctor Review"
                                            : "✓ Mark Case as Reviewed"}
                                    </button>

                                    {verificationMessage && (
                                        <div className="verificationMessage">
                                            {verificationMessage}
                                        </div>
                                    )}

                                </div>

                            </>
                        )}

                    </div>

                </section>

                {/* FOOTER */}

                <footer>
                    <span>
                        MediKiosk • AI-assisted patient
                        case-taking system
                    </span>

                    <span>
                        AI output is documentation assistance
                        only • Doctor verification required
                    </span>
                </footer>

            </main>

            {/* =================================================
                STYLES
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    background: #f5f7fb;
                }

                .dashboard {
                    min-height: 100vh;
                    display: flex;
                    background: #f5f7fb;
                    color: #172033;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                /* SIDEBAR */

                .sidebar {
                    width: 245px;
                    min-height: 100vh;
                    background: #ffffff;
                    border-right: 1px solid #e8ebf0;
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 5px 10px 30px;
                }

                .brandIcon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #2563eb;
                    color: white;
                    font-size: 22px;
                    font-weight: 700;
                    box-shadow: 0 7px 20px rgba(37, 99, 235, .2);
                }

                .brand h2 {
                    margin: 0;
                    font-size: 18px;
                    letter-spacing: -.4px;
                }

                .brand span {
                    display: block;
                    color: #8a93a3;
                    font-size: 11px;
                    margin-top: 2px;
                }

                .sidebarLabel {
                    font-size: 10px;
                    font-weight: 700;
                    color: #9ca3af;
                    letter-spacing: 1px;
                    padding: 0 12px;
                    margin: 10px 0;
                }

                .sideItem {
                    padding: 12px 14px;
                    margin: 5px 0;
                    border-radius: 10px;
                    color: #697386;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;
                }

                .sideItem span {
                    width: 20px;
                    text-align: center;
                    font-size: 17px;
                }

                .sideItem.active {
                    background: #eff5ff;
                    color: #2563eb;
                    font-weight: 650;
                }

                .sidebarBottom {
                    margin-top: auto;
                    border-top: 1px solid #edf0f4;
                    padding-top: 18px;
                }

                .doctorProfile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                }

                .doctorAvatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 800;
                }

                .doctorProfile strong {
                    display: block;
                    font-size: 12px;
                }

                .doctorProfile span {
                    display: block;
                    font-size: 10px;
                    color: #8b95a5;
                    margin-top: 2px;
                }

                /* MAIN */

                .main {
                    width: calc(100% - 245px);
                    margin-left: 245px;
                    padding: 30px 34px 20px;
                    min-width: 0;
                }

                .topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .eyebrow,
                .caseLabel {
                    margin: 0 0 7px;
                    font-size: 10px;
                    letter-spacing: 1.2px;
                    font-weight: 800;
                    color: #2563eb;
                }

                .topbar h1 {
                    margin: 0;
                    font-size: 28px;
                    letter-spacing: -.8px;
                }

                .subtitle {
                    margin: 7px 0 0;
                    color: #7c8798;
                    font-size: 13px;
                }

                .topActions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .statusPill {
                    padding: 9px 13px;
                    border-radius: 20px;
                    background: white;
                    border: 1px solid #e8ebf0;
                    color: #667085;
                    font-size: 12px;
                    display: flex;
                    gap: 7px;
                    align-items: center;
                }

                .statusDot {
                    width: 7px;
                    height: 7px;
                    background: #22c55e;
                    border-radius: 50%;
                }

                .refreshBtn,
                .secondaryBtn {
                    border: 1px solid #dfe4eb;
                    background: white;
                    color: #475467;
                    padding: 10px 15px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                }

                /* MESSAGE */

                .message {
                    background: #fff8e7;
                    border: 1px solid #f5df9b;
                    color: #765b15;
                    padding: 12px 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    font-size: 13px;
                }

                .message button {
                    margin-left: auto;
                    border: 0;
                    background: transparent;
                    font-size: 18px;
                    cursor: pointer;
                    color: #765b15;
                }

                /* STATS */

                .statsGrid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .statCard {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    padding: 18px;
                    display: flex;
                    gap: 14px;
                    align-items: center;
                    box-shadow: 0 3px 15px rgba(18, 38, 63, .025);
                }

                .statIcon {
                    width: 43px;
                    height: 43px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 19px;
                    font-weight: 700;
                }

                .statIcon.blue {
                    background: #eef5ff;
                    color: #2563eb;
                }

                .statIcon.green {
                    background: #ecfdf3;
                    color: #16a34a;
                }

                .statIcon.orange {
                    background: #fff7ed;
                    color: #ea580c;
                }

                .statIcon.purple {
                    background: #f5f3ff;
                    color: #7c3aed;
                }

                .statCard span {
                    display: block;
                    color: #8a94a4;
                    font-size: 11px;
                }

                .statCard strong {
                    display: block;
                    font-size: 23px;
                    margin-top: 3px;
                    letter-spacing: -.5px;
                }

                .statCard small {
                    display: block;
                    color: #a0a8b5;
                    font-size: 10px;
                    margin-top: 2px;
                }

                /* SEARCH */

                .searchCard {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    padding: 19px;
                    margin-bottom: 20px;
                }

                .searchHeading h3 {
                    margin: 0;
                    font-size: 15px;
                }

                .searchHeading p {
                    margin: 4px 0 14px;
                    color: #8a94a4;
                    font-size: 11px;
                }

                .searchForm {
                    display: flex;
                    gap: 9px;
                }

                .searchInput {
                    flex: 1;
                    height: 42px;
                    border: 1px solid #dfe4eb;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    padding: 0 13px;
                    gap: 9px;
                }

                .searchInput span {
                    color: #9aa3b1;
                    font-size: 20px;
                }

                .searchInput input {
                    width: 100%;
                    border: 0;
                    outline: 0;
                    font-size: 12px;
                    color: #344054;
                    background: transparent;
                }

                .primaryBtn {
                    height: 42px;
                    border: 0;
                    border-radius: 9px;
                    background: #2563eb;
                    color: white;
                    padding: 0 22px;
                    font-weight: 650;
                    cursor: pointer;
                    font-size: 12px;
                }

                /* WORKSPACE */

                .workspace {
                    display: grid;
                    grid-template-columns: 310px minmax(0, 1fr);
                    gap: 18px;
                    align-items: start;
                }

                .patientPanel {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    overflow: hidden;
                    position: sticky;
                    top: 20px;
                    max-height: calc(100vh - 40px);
                }

                .panelHeader {
                    padding: 18px;
                    border-bottom: 1px solid #edf0f4;
                }

                .panelHeader h3 {
                    margin: 0;
                    font-size: 15px;
                }

                .panelHeader span {
                    display: block;
                    color: #929bab;
                    font-size: 11px;
                    margin-top: 4px;
                }

                .patientList {
                    max-height: calc(100vh - 130px);
                    overflow-y: auto;
                    padding: 8px;
                }

                .patientItem {
                    width: 100%;
                    border: 1px solid transparent;
                    background: white;
                    padding: 12px 9px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-align: left;
                    cursor: pointer;
                    margin-bottom: 4px;
                }

                .patientItem:hover {
                    background: #f8faff;
                }

                .patientItem.selected {
                    background: #eff5ff;
                    border-color: #d8e6ff;
                }

                .patientAvatar {
                    flex: 0 0 39px;
                    width: 39px;
                    height: 39px;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 800;
                }

                .patientInfo {
                    min-width: 0;
                    flex: 1;
                }

                .patientInfo strong {
                    display: block;
                    font-size: 12px;
                    color: #344054;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .patientInfo span,
                .patientInfo small {
                    display: block;
                    font-size: 10px;
                    color: #8c96a5;
                    margin-top: 3px;
                }

                .arrow {
                    color: #a2a9b5;
                    font-size: 20px;
                }

                /* EMPTY */

                .emptyState,
                .welcomePanel {
                    text-align: center;
                    padding: 50px 25px;
                    color: #8993a3;
                }

                .emptyIcon,
                .welcomeIcon {
                    width: 55px;
                    height: 55px;
                    border-radius: 16px;
                    background: #eff5ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 14px;
                    font-size: 23px;
                }

                .emptyState strong {
                    display: block;
                    color: #475467;
                    font-size: 13px;
                }

                .emptyState p,
                .welcomePanel p {
                    font-size: 11px;
                    line-height: 1.7;
                    margin: 7px auto 0;
                    max-width: 430px;
                }

                .welcomePanel {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .welcomePanel h2 {
                    color: #263247;
                    margin: 0;
                    font-size: 19px;
                }

                .workflowMini {
                    margin: 28px auto 0;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color: #8b95a5;
                    font-size: 9px;
                }

                .workflowMini div:not(.line) {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .workflowMini span {
                    width: 23px;
                    height: 23px;
                    border-radius: 50%;
                    background: #eff5ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .workflowMini .line {
                    width: 25px;
                    height: 1px;
                    background: #dfe4eb;
                }

                /* DETAILS */

                .detailsPanel {
                    min-width: 0;
                }

                .patientHero {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    padding: 22px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                }

                .largeAvatar {
                    width: 62px;
                    height: 62px;
                    flex: 0 0 62px;
                    border-radius: 17px;
                    background: #eaf1ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: 800;
                }

                .heroInfo {
                    min-width: 0;
                    flex: 1;
                }

                .heroInfo h2 {
                    margin: 0;
                    font-size: 22px;
                    letter-spacing: -.5px;
                }

                .heroInfo p {
                    margin: 5px 0;
                    color: #7e8898;
                    font-size: 12px;
                }

                .heroTags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 9px;
                }

                .heroTags span {
                    background: #f5f7fa;
                    color: #798494;
                    border-radius: 6px;
                    padding: 5px 8px;
                    font-size: 9px;
                }

                .reviewBadge,
                .verificationStatus {
                    background: #fff7ed;
                    color: #c2410c;
                    border: 1px solid #fed7aa;
                    padding: 7px 10px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .reviewBadge.reviewed,
                .verificationStatus.reviewed {
                    background: #ecfdf3;
                    border-color: #bbf7d0;
                    color: #15803d;
                }

                .infoGrid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-top: 12px;
                }

                .infoCard {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 11px;
                    padding: 13px;
                }

                .infoCard span {
                    display: block;
                    color: #919aa8;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                }

                .infoCard strong {
                    display: block;
                    margin-top: 5px;
                    color: #344054;
                    font-size: 12px;
                }

                /* SECTION */

                .sectionCard,
                .verificationCard {
                    background: white;
                    border: 1px solid #e9edf2;
                    border-radius: 14px;
                    padding: 21px;
                    margin-top: 13px;
                }

                .sectionHeader {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 17px;
                }

                .sectionTitle {
                    display: flex;
                    gap: 11px;
                    align-items: flex-start;
                }

                .sectionIcon {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    flex: 0 0 34px;
                }

                .sectionIcon.ai {
                    background: #f3f0ff;
                    color: #7c3aed;
                }

                .sectionIcon.attention {
                    background: #fff4ed;
                    color: #ea580c;
                }

                .sectionIcon.medical {
                    background: #ecfdf3;
                    color: #16a34a;
                }

                .sectionIcon.interview {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .sectionIcon.document {
                    background: #f1f5f9;
                    color: #475569;
                }

                .sectionTitle h3 {
                    margin: 0;
                    font-size: 15px;
                }

                .sectionTitle p {
                    margin: 4px 0 0;
                    color: #8b95a4;
                    font-size: 10px;
                    line-height: 1.5;
                }

                .aiButton,
                .attentionButton {
                    border: 0;
                    border-radius: 8px;
                    padding: 9px 12px;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .aiButton {
                    background: #7c3aed;
                }

                .attentionButton {
                    background: #ea580c;
                }

                .aiButton:disabled,
                .attentionButton:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }

                .aiContent pre,
                .documentBlock pre {
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                    font-size: 11px;
                    line-height: 1.7;
                    color: #475467;
                    background: #f8fafc;
                    border: 1px solid #edf0f4;
                    border-radius: 10px;
                    padding: 16px;
                    margin: 0;
                    max-height: 600px;
                    overflow-y: auto;
                }

                .warningBox {
                    margin-top: 11px;
                    background: #fff9eb;
                    border: 1px solid #f5e2ad;
                    border-radius: 9px;
                    padding: 11px;
                    display: flex;
                    gap: 9px;
                    color: #805f14;
                }

                .warningBox span {
                    font-size: 14px;
                }

                .warningBox strong {
                    font-size: 10px;
                }

                .warningBox p {
                    margin: 3px 0 0;
                    font-size: 9px;
                    line-height: 1.5;
                }

                .notGenerated {
                    background: #f8fafc;
                    border: 1px dashed #dce2e9;
                    border-radius: 10px;
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    color: #8b95a4;
                    font-size: 10px;
                }

                .notGenerated span {
                    width: 27px;
                    height: 27px;
                    border-radius: 8px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7c3aed;
                    font-weight: 700;
                }

                /* FLAGS */

                .flagList {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }

                .flagCard {
                    background: #fff8f6;
                    border: 1px solid #fed7d1;
                    border-radius: 10px;
                    padding: 13px;
                }

                .flagTop {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #b42318;
                    font-size: 11px;
                }

                .flagIcon {
                    width: 24px;
                    height: 24px;
                    border-radius: 7px;
                    background: #fee4e2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                }

                .flagDetails {
                    margin-left: 32px;
                }

                .flagDetails p {
                    margin: 9px 0 0;
                    font-size: 10px;
                    line-height: 1.5;
                    color: #667085;
                }

                .flagDetails b {
                    display: block;
                    color: #344054;
                    margin-bottom: 2px;
                }

                .smallWarning {
                    margin-top: 12px;
                    padding: 9px 11px;
                    background: #fff9eb;
                    color: #80621b;
                    border-radius: 8px;
                    font-size: 9px;
                    line-height: 1.5;
                }

                /* MEDICAL */

                .medicalGrid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .medicalGrid > div {
                    background: #f8fafc;
                    border: 1px solid #edf0f4;
                    border-radius: 9px;
                    padding: 13px;
                }

                .medicalGrid label {
                    display: block;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: .4px;
                    color: #8d97a6;
                    font-weight: 700;
                }

                .medicalGrid p {
                    margin: 7px 0 0;
                    font-size: 11px;
                    line-height: 1.6;
                    color: #475467;
                    white-space: pre-wrap;
                }

                /* INTERVIEW */

                .statusTag,
                .documentCount {
                    padding: 6px 9px;
                    border-radius: 7px;
                    font-size: 9px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .statusTag.complete {
                    background: #ecfdf3;
                    color: #15803d;
                }

                .statusTag.pending {
                    background: #fff7ed;
                    color: #c2410c;
                }

                .documentCount {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .interviewList {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .questionCard {
                    display: flex;
                    gap: 11px;
                    padding: 13px;
                    border-radius: 9px;
                    background: #f8fafc;
                    border: 1px solid #edf0f4;
                }

                .questionCard > span {
                    width: 27px;
                    height: 27px;
                    flex: 0 0 27px;
                    background: #eaf1ff;
                    color: #2563eb;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 800;
                }

                .questionCard strong {
                    display: block;
                    font-size: 10px;
                    color: #344054;
                    line-height: 1.5;
                }

                .questionCard p {
                    margin: 5px 0 0;
                    font-size: 10px;
                    line-height: 1.6;
                    color: #667085;
                }

                /* DOCUMENTS */

                .documentsList {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .documentCard {
                    border: 1px solid #e7ebf0;
                    border-radius: 11px;
                    padding: 15px;
                }

                .documentHeader {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .fileIcon {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    background: #f1f5f9;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .documentHeader h4 {
                    margin: 0;
                    font-size: 11px;
                    color: #344054;
                }

                .documentHeader span {
                    display: block;
                    color: #98a1af;
                    font-size: 9px;
                    margin-top: 3px;
                }

                .documentStatus {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                    margin: 12px 0;
                }

                .successTag,
                .failedTag {
                    padding: 5px 7px;
                    border-radius: 6px;
                    font-size: 8px;
                    font-weight: 700;
                }

                .successTag {
                    background: #ecfdf3;
                    color: #15803d;
                }

                .failedTag {
                    background: #fef2f2;
                    color: #b91c1c;
                }

                .documentBlock {
                    margin-top: 10px;
                }

                .documentBlock h5 {
                    margin: 0 0 6px;
                    font-size: 9px;
                    color: #475467;
                }

                .documentBlock pre {
                    max-height: 300px;
                    font-size: 10px;
                }

                .documentBlock.aiDoc pre {
                    background: #f8f6ff;
                    border-color: #e8e0ff;
                }

                /* VERIFICATION */

                .verificationCard {
                    background: linear-gradient(
                        145deg,
                        #ffffff,
                        #f8fbff
                    );
                    border-color: #dce8fb;
                    margin-bottom: 25px;
                }

                .verificationHeader {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 18px;
                }

                .verificationHeader h3 {
                    margin: 0;
                    font-size: 17px;
                }

                .verificationHeader p {
                    margin: 5px 0 0;
                    font-size: 10px;
                    color: #8791a0;
                }

                .verificationCard label {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    color: #475467;
                    margin-bottom: 7px;
                }

                .verificationCard textarea {
                    width: 100%;
                    border: 1px solid #dfe4eb;
                    border-radius: 9px;
                    padding: 12px;
                    resize: vertical;
                    outline: 0;
                    font-family: inherit;
                    font-size: 11px;
                    color: #344054;
                    background: white;
                }

                .verificationCard textarea:focus {
                    border-color: #8bb2f7;
                    box-shadow: 0 0 0 3px #eff5ff;
                }

                .verifyButton {
                    width: 100%;
                    border: 0;
                    border-radius: 9px;
                    margin-top: 10px;
                    padding: 12px;
                    background: #2563eb;
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .verifyButton.reviewed {
                    background: #16a34a;
                }

                .verifyButton:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .verificationMessage {
                    margin-top: 9px;
                    padding: 9px;
                    border-radius: 7px;
                    background: #eff6ff;
                    color: #31558d;
                    font-size: 9px;
                }

                /* LOADER */

                .loader {
                    width: 25px;
                    height: 25px;
                    border: 3px solid #e4eaf2;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* FOOTER */

                footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    color: #9aa3b1;
                    font-size: 9px;
                    padding: 18px 3px 5px;
                }

                /* RESPONSIVE */

                @media (max-width: 1200px) {
                    .statsGrid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .workspace {
                        grid-template-columns: 270px minmax(0, 1fr);
                    }

                    .infoGrid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .sidebar {
                        width: 70px;
                        padding: 20px 9px;
                    }

                    .brand {
                        justify-content: center;
                        padding-left: 0;
                        padding-right: 0;
                    }

                    .brand > div:last-child,
                    .sidebarLabel,
                    .sideItem:not(.active)::after,
                    .sideItem {
                        font-size: 0;
                    }

                    .sideItem {
                        justify-content: center;
                        padding: 13px;
                    }

                    .sideItem span {
                        font-size: 17px;
                    }

                    .brandIcon {
                        width: 38px;
                    }

                    .doctorProfile {
                        justify-content: center;
                    }

                    .doctorProfile > div:last-child {
                        display: none;
                    }

                    .main {
                        width: calc(100% - 70px);
                        margin-left: 70px;
                        padding: 24px 18px;
                    }

                    .workspace {
                        grid-template-columns: 1fr;
                    }

                    .patientPanel {
                        position: static;
                        max-height: none;
                    }

                    .patientList {
                        max-height: 330px;
                    }
                }

                @media (max-width: 650px) {
                    .main {
                        padding: 18px 12px;
                    }

                    .topbar {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .topActions {
                        width: 100%;
                    }

                    .statusPill,
                    .refreshBtn {
                        flex: 1;
                    }

                    .statsGrid {
                        grid-template-columns: 1fr;
                    }

                    .searchForm {
                        flex-wrap: wrap;
                    }

                    .searchInput {
                        flex-basis: 100%;
                    }

                    .primaryBtn,
                    .secondaryBtn {
                        flex: 1;
                    }

                    .patientHero {
                        flex-wrap: wrap;
                    }

                    .reviewBadge {
                        width: 100%;
                        text-align: center;
                    }

                    .infoGrid,
                    .medicalGrid {
                        grid-template-columns: 1fr;
                    }

                    .sectionHeader,
                    .verificationHeader {
                        flex-direction: column;
                    }

                    .aiButton,
                    .attentionButton {
                        width: 100%;
                    }

                    .workflowMini {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    footer {
                        flex-direction: column;
                    }
                }

            `}</style>
        </div>
    );
}

export default DoctorDashboard;