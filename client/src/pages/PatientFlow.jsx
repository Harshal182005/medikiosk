import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PatientFlow() {
    const navigate = useNavigate();

    const [language, setLanguage] = useState("");
    const [showRegistration, setShowRegistration] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        phone: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const selectLanguage = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        setShowRegistration(true);
        setMessage("");
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.post(
                `${BACKEND_URL}/api/patients/register`,
                {
                    ...formData,
                    preferredLanguage: language
                }
            );

            const patientId =
                response.data?.patient?._id;

            if (!patientId) {
                setMessage(
                    "Registration completed, but patient ID was not received."
                );
                return;
            }

            localStorage.setItem(
                "patientId",
                patientId
            );

            localStorage.setItem(
                "patientLanguage",
                language
            );

            localStorage.setItem(
                "patientName",
                formData.name
            );

            navigate("/patient/interview");

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-page">

            {/* ================= NAVBAR ================= */}

            <nav className="patient-navbar">

                <div className="brand">
                    <div className="brand-icon">
                        +
                    </div>

                    <div>
                        <div className="brand-name">
                            MediKiosk
                        </div>

                        <div className="brand-tagline">
                            AI-assisted patient care
                        </div>
                    </div>
                </div>

                <div className="secure-badge">
                    <span className="secure-dot"></span>
                    Secure Patient Portal
                </div>

            </nav>

            {/* ================= LANGUAGE SCREEN ================= */}

            {!showRegistration && (
                <main className="patient-main">

                    <section className="hero-section">

                        <div className="hero-badge">
                            <span>✦</span>
                            AI-Powered Healthcare
                        </div>

                        <h1>
                            Your health story,
                            <br />
                            <span>heard and understood.</span>
                        </h1>

                        <p className="hero-description">
                            MediKiosk helps you share your medical
                            history naturally through voice or text.
                            Your information is organized for your doctor
                            before your consultation.
                        </p>

                        <div className="hero-features">

                            <div className="feature-item">
                                <div className="feature-icon">
                                    🎙️
                                </div>

                                <div>
                                    <strong>
                                        Speak naturally
                                    </strong>

                                    <span>
                                        Voice or text answers
                                    </span>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    🧠
                                </div>

                                <div>
                                    <strong>
                                        AI organized
                                    </strong>

                                    <span>
                                        Structured medical history
                                    </span>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    👨‍⚕️
                                </div>

                                <div>
                                    <strong>
                                        Doctor reviewed
                                    </strong>

                                    <span>
                                        AI never replaces your doctor
                                    </span>
                                </div>
                            </div>

                        </div>

                    </section>

                    {/* LANGUAGE CARD */}

                    <section className="language-card">

                        <div className="card-top-icon">
                            🌐
                        </div>

                        <h2>
                            Choose your language
                        </h2>

                        <p>
                            Select the language you are most
                            comfortable speaking.
                        </p>

                        <div className="language-options">

                            <button
                                type="button"
                                onClick={() =>
                                    selectLanguage("English")
                                }
                                className="language-button"
                            >
                                <span className="language-symbol">
                                    EN
                                </span>

                                <span className="language-content">
                                    <strong>
                                        English
                                    </strong>

                                    <small>
                                        Continue in English
                                    </small>
                                </span>

                                <span className="arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    selectLanguage("Hindi")
                                }
                                className="language-button"
                            >
                                <span className="language-symbol">
                                    हिं
                                </span>

                                <span className="language-content">
                                    <strong>
                                        हिन्दी
                                    </strong>

                                    <small>
                                        हिंदी में जारी रखें
                                    </small>
                                </span>

                                <span className="arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    selectLanguage("Marathi")
                                }
                                className="language-button"
                            >
                                <span className="language-symbol">
                                    म
                                </span>

                                <span className="language-content">
                                    <strong>
                                        मराठी
                                    </strong>

                                    <small>
                                        मराठीत पुढे जा
                                    </small>
                                </span>

                                <span className="arrow">
                                    →
                                </span>
                            </button>

                        </div>

                        <div className="privacy-note">
                            <span>🔒</span>
                            Your information is used only
                            for preparing your medical case.
                        </div>

                    </section>

                </main>
            )}

            {/* ================= REGISTRATION ================= */}

            {showRegistration && (
                <main className="registration-page">

                    <div className="registration-wrapper">

                        <button
                            type="button"
                            className="back-button"
                            onClick={() => {
                                setShowRegistration(false);
                                setMessage("");
                            }}
                        >
                            ← Change language
                        </button>

                        <div className="registration-header">

                            <div className="step-indicator">
                                <span className="step active">
                                    1
                                </span>

                                <span className="step-line"></span>

                                <span className="step">
                                    2
                                </span>

                                <span className="step-line"></span>

                                <span className="step">
                                    3
                                </span>
                            </div>

                            <div className="step-labels">
                                <span className="active-label">
                                    Registration
                                </span>

                                <span>
                                    Health Interview
                                </span>

                                <span>
                                    Doctor Review
                                </span>
                            </div>

                        </div>

                        <div className="registration-card">

                            <div className="registration-intro">

                                <div className="intro-icon">
                                    👋
                                </div>

                                <div>
                                    <div className="selected-language">
                                        {language} selected
                                    </div>

                                    <h1>
                                        Let's get to know you
                                    </h1>

                                    <p>
                                        Please provide some basic
                                        information before we begin
                                        your health interview.
                                    </p>
                                </div>

                            </div>

                            <form
                                onSubmit={
                                    handleRegistration
                                }
                            >

                                <div className="form-grid">

                                    <div className="form-group full-width">
                                        <label>
                                            Full Name
                                        </label>

                                        <div className="input-wrapper">
                                            <span>
                                                👤
                                            </span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Age
                                        </label>

                                        <div className="input-wrapper">
                                            <span>
                                                🎂
                                            </span>

                                            <input
                                                type="number"
                                                name="age"
                                                value={
                                                    formData.age
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Age"
                                                min="1"
                                                max="120"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Gender
                                        </label>

                                        <div className="input-wrapper">
                                            <span>
                                                ⚧
                                            </span>

                                            <select
                                                name="gender"
                                                value={
                                                    formData.gender
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select gender
                                                </option>

                                                <option value="Male">
                                                    Male
                                                </option>

                                                <option value="Female">
                                                    Female
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            Phone Number
                                        </label>

                                        <div className="input-wrapper">
                                            <span>
                                                📱
                                            </span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your phone number"
                                                required
                                            />
                                        </div>
                                    </div>

                                </div>

                                {message && (
                                    <div className="error-message">
                                        <span>⚠️</span>
                                        {message}
                                    </div>
                                )}

                                <div className="form-footer">

                                    <div className="form-security">
                                        <span>🔐</span>

                                        <div>
                                            <strong>
                                                Your information is protected
                                            </strong>

                                            <small>
                                                MediKiosk uses your
                                                information only to
                                                prepare your medical case.
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="continue-button"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Creating profile..."
                                            : "Continue to Health Interview →"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </main>
            )}

            {/* ================= FOOTER ================= */}

            <footer className="patient-footer">
                <span>
                    MediKiosk
                </span>

                <span>
                    AI-assisted documentation •
                    Doctor verification required
                </span>
            </footer>

            {/* ================= STYLES ================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .patient-page {
                    min-height: 100vh;
                    background:
                        radial-gradient(
                            circle at 15% 15%,
                            rgba(20, 184, 166, 0.10),
                            transparent 28%
                        ),
                        radial-gradient(
                            circle at 85% 20%,
                            rgba(37, 99, 235, 0.10),
                            transparent 30%
                        ),
                        #f7fafc;
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

                .patient-navbar {
                    height: 78px;
                    padding: 0 6%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.88);
                    border-bottom: 1px solid #e7edf3;
                    backdrop-filter: blur(15px);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: linear-gradient(
                        135deg,
                        #2563eb,
                        #0f766e
                    );
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 29px;
                    font-weight: 300;
                    box-shadow:
                        0 8px 20px rgba(37, 99, 235, 0.22);
                }

                .brand-name {
                    font-size: 20px;
                    font-weight: 750;
                    letter-spacing: -0.5px;
                }

                .brand-tagline {
                    font-size: 11px;
                    color: #7b8797;
                    margin-top: 1px;
                }

                .secure-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #536174;
                    background: #f1f7f5;
                    border: 1px solid #dcebe7;
                    padding: 9px 14px;
                    border-radius: 999px;
                }

                .secure-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #10b981;
                }

                /* MAIN */

                .patient-main {
                    width: min(1180px, 90%);
                    margin: 0 auto;
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1.15fr 0.85fr;
                    align-items: center;
                    gap: 75px;
                    padding: 70px 0 55px;
                }

                .hero-badge {
                    width: fit-content;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 13px;
                    border-radius: 999px;
                    background: #edf6ff;
                    color: #2563eb;
                    border: 1px solid #dcecff;
                    font-size: 12px;
                    font-weight: 700;
                    margin-bottom: 22px;
                }

                .hero-badge span {
                    font-size: 15px;
                }

                .hero-section h1 {
                    font-size: clamp(42px, 5vw, 64px);
                    line-height: 1.05;
                    letter-spacing: -2.8px;
                    margin: 0;
                    font-weight: 800;
                    color: #142033;
                }

                .hero-section h1 span {
                    color: #2563eb;
                }

                .hero-description {
                    max-width: 620px;
                    margin-top: 24px;
                    color: #667386;
                    font-size: 17px;
                    line-height: 1.7;
                }

                .hero-features {
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                    margin-top: 36px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }

                .feature-icon {
                    width: 43px;
                    height: 43px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #e3eaf1;
                    box-shadow:
                        0 5px 15px rgba(25, 45, 70, 0.05);
                    font-size: 19px;
                }

                .feature-item strong,
                .feature-item span {
                    display: block;
                }

                .feature-item strong {
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .feature-item span {
                    color: #8792a1;
                    font-size: 12px;
                }

                /* LANGUAGE CARD */

                .language-card {
                    background: rgba(255, 255, 255, 0.96);
                    border: 1px solid #e2e9f0;
                    border-radius: 25px;
                    padding: 34px;
                    box-shadow:
                        0 25px 70px rgba(30, 55, 85, 0.10);
                }

                .card-top-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 15px;
                    background: #edf5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 23px;
                    margin-bottom: 22px;
                }

                .language-card h2 {
                    margin: 0;
                    font-size: 26px;
                    letter-spacing: -0.8px;
                }

                .language-card > p {
                    color: #7b8796;
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 8px 0 24px;
                }

                .language-options {
                    display: flex;
                    flex-direction: column;
                    gap: 11px;
                }

                .language-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    text-align: left;
                    gap: 13px;
                    padding: 13px;
                    border-radius: 14px;
                    border: 1px solid #e1e8ef;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #172033;
                }

                .language-button:hover {
                    border-color: #8fb5f5;
                    transform: translateY(-2px);
                    box-shadow:
                        0 8px 20px rgba(37, 99, 235, 0.10);
                }

                .language-symbol {
                    width: 43px;
                    height: 43px;
                    border-radius: 11px;
                    background: #f2f6fb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 800;
                    color: #2563eb;
                }

                .language-content {
                    flex: 1;
                }

                .language-content strong,
                .language-content small {
                    display: block;
                }

                .language-content strong {
                    font-size: 14px;
                }

                .language-content small {
                    color: #8994a2;
                    font-size: 11px;
                    margin-top: 3px;
                }

                .arrow {
                    color: #9ba6b5;
                    font-size: 19px;
                }

                .privacy-note {
                    margin-top: 20px;
                    padding-top: 17px;
                    border-top: 1px solid #edf0f4;
                    color: #8994a2;
                    font-size: 11px;
                    line-height: 1.5;
                    display: flex;
                    gap: 7px;
                }

                /* REGISTRATION */

                .registration-page {
                    flex: 1;
                    padding: 48px 20px 65px;
                }

                .registration-wrapper {
                    width: min(720px, 100%);
                    margin: auto;
                }

                .back-button {
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 13px;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 32px;
                }

                .back-button:hover {
                    color: #2563eb;
                }

                .registration-header {
                    margin-bottom: 30px;
                }

                .step-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .step {
                    width: 31px;
                    height: 31px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e8edf3;
                    color: #8994a2;
                    font-size: 12px;
                    font-weight: 700;
                }

                .step.active {
                    background: #2563eb;
                    color: white;
                    box-shadow:
                        0 5px 14px rgba(37, 99, 235, 0.25);
                }

                .step-line {
                    width: 80px;
                    height: 1px;
                    background: #dfe5eb;
                }

                .step-labels {
                    display: flex;
                    justify-content: space-between;
                    margin: 9px 35px 0;
                    font-size: 10px;
                    color: #98a2af;
                }

                .active-label {
                    color: #2563eb;
                    font-weight: 700;
                }

                .registration-card {
                    background: white;
                    border: 1px solid #e1e8ef;
                    border-radius: 24px;
                    padding: 35px;
                    box-shadow:
                        0 20px 60px rgba(30, 55, 85, 0.09);
                }

                .registration-intro {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    margin-bottom: 30px;
                }

                .intro-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    background: #edf5ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 23px;
                    flex-shrink: 0;
                }

                .selected-language {
                    display: inline-block;
                    color: #2563eb;
                    background: #eff6ff;
                    padding: 5px 9px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .registration-intro h1 {
                    margin: 0;
                    font-size: 28px;
                    letter-spacing: -1px;
                }

                .registration-intro p {
                    color: #7b8796;
                    font-size: 13px;
                    margin: 7px 0 0;
                    line-height: 1.5;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 19px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #344054;
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    border: 1px solid #dce3ea;
                    border-radius: 11px;
                    background: #fbfcfd;
                    transition: all 0.2s ease;
                    overflow: hidden;
                }

                .input-wrapper:focus-within {
                    border-color: #6d9eec;
                    background: white;
                    box-shadow:
                        0 0 0 3px rgba(37, 99, 235, 0.08);
                }

                .input-wrapper > span {
                    padding-left: 13px;
                    font-size: 14px;
                }

                .input-wrapper input,
                .input-wrapper select {
                    width: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    padding: 13px 13px 13px 9px;
                    font-size: 13px;
                    color: #172033;
                }

                .input-wrapper input::placeholder {
                    color: #a3acb8;
                }

                .input-wrapper select {
                    cursor: pointer;
                }

                .error-message {
                    margin-top: 20px;
                    padding: 12px 14px;
                    border-radius: 10px;
                    background: #fff5f5;
                    border: 1px solid #ffdcdc;
                    color: #c24141;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-footer {
                    border-top: 1px solid #edf0f4;
                    margin-top: 30px;
                    padding-top: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 25px;
                }

                .form-security {
                    display: flex;
                    gap: 9px;
                    align-items: flex-start;
                    color: #758194;
                }

                .form-security > span {
                    font-size: 16px;
                }

                .form-security strong,
                .form-security small {
                    display: block;
                }

                .form-security strong {
                    font-size: 10px;
                    color: #566274;
                }

                .form-security small {
                    max-width: 230px;
                    font-size: 9px;
                    line-height: 1.4;
                    margin-top: 3px;
                }

                .continue-button {
                    border: none;
                    border-radius: 11px;
                    padding: 14px 20px;
                    background: linear-gradient(
                        135deg,
                        #2563eb,
                        #1d4ed8
                    );
                    color: white;
                    font-weight: 700;
                    font-size: 12px;
                    cursor: pointer;
                    box-shadow:
                        0 9px 20px rgba(37, 99, 235, 0.20);
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .continue-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow:
                        0 12px 25px rgba(37, 99, 235, 0.27);
                }

                .continue-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* FOOTER */

                .patient-footer {
                    width: min(1180px, 90%);
                    margin: auto;
                    padding: 20px 0;
                    border-top: 1px solid #e7edf2;
                    display: flex;
                    justify-content: space-between;
                    color: #9aa4b1;
                    font-size: 10px;
                }

                .patient-footer span:first-child {
                    font-weight: 700;
                    color: #64748b;
                }

                /* RESPONSIVE */

                @media (max-width: 850px) {

                    .patient-main {
                        grid-template-columns: 1fr;
                        gap: 45px;
                        padding-top: 45px;
                    }

                    .hero-section {
                        text-align: center;
                    }

                    .hero-badge {
                        margin-left: auto;
                        margin-right: auto;
                    }

                    .hero-description {
                        margin-left: auto;
                        margin-right: auto;
                    }

                    .hero-features {
                        align-items: flex-start;
                        width: fit-content;
                        margin-left: auto;
                        margin-right: auto;
                        text-align: left;
                    }

                }

                @media (max-width: 600px) {

                    .patient-navbar {
                        padding: 0 5%;
                    }

                    .secure-badge {
                        display: none;
                    }

                    .patient-main {
                        width: 90%;
                    }

                    .hero-section h1 {
                        font-size: 42px;
                    }

                    .language-card,
                    .registration-card {
                        padding: 24px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .full-width {
                        grid-column: auto;
                    }

                    .form-footer {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .continue-button {
                        width: 100%;
                    }

                    .patient-footer {
                        width: 90%;
                        flex-direction: column;
                        gap: 6px;
                    }

                    .step-line {
                        width: 45px;
                    }

                    .step-labels {
                        margin-left: 15px;
                        margin-right: 15px;
                        font-size: 8px;
                    }
                }

            `}</style>
        </div>
    );
}

export default PatientFlow;