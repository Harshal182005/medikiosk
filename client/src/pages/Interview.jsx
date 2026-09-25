import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Interview() {
    const navigate = useNavigate();

    const patientId = localStorage.getItem("patientId");

    const language =
        localStorage.getItem("patientLanguage") || "English";

    const patientName =
        localStorage.getItem("patientName") || "Patient";

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);

    const [listening, setListening] = useState(false);
    const [message, setMessage] = useState("");

    const totalQuestions = 10;

    const currentQuestion = Math.min(
        answers.length + 1,
        totalQuestions
    );

    const progress =
        ((currentQuestion - 1) / totalQuestions) * 100;

    // ==========================================
    // LANGUAGE
    // ==========================================

    const getSpeechLanguage = () => {
        if (language === "Hindi") {
            return "hi-IN";
        }

        if (language === "Marathi") {
            return "mr-IN";
        }

        return "en-IN";
    };

    // ==========================================
    // SPEAK QUESTION
    // ==========================================

    const speakQuestion = (text) => {
        if (!window.speechSynthesis || !text) {
            return;
        }

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = getSpeechLanguage();
        speech.rate = 0.9;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
    };

    // ==========================================
    // GET NEXT QUESTION
    // ==========================================

    const getNextQuestion = async (
        currentAnswers = []
    ) => {
        try {
            setLoading(true);
            setMessage("");

            if (!patientId) {
                setMessage(
                    "Patient information not found. Please register again."
                );
                return;
            }

            const response = await axios.post(
                `${BACKEND_URL}/api/interview/next-question`,
                {
                    patientId,
                    language,
                    answers: currentAnswers
                }
            );

            if (response.data?.completed) {
                setCompleted(true);
                setQuestion("");
                return;
            }

            const nextQuestion =
                response.data?.question;

            if (!nextQuestion) {
                setMessage(
                    "No question was received from the server."
                );
                return;
            }

            setQuestion(nextQuestion);

            setTimeout(() => {
                speakQuestion(nextQuestion);
            }, 250);

        } catch (error) {
            console.error(
                "Question error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to load question."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL QUESTION
    // ==========================================

    useEffect(() => {
        if (!patientId) {
            setMessage(
                "Patient information not found. Please register again."
            );

            setLoading(false);
            return;
        }

        getNextQuestion([]);

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ==========================================
    // SUBMIT ANSWER
    // ==========================================

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            setMessage(
                "Please provide an answer before continuing."
            );
            return;
        }

        if (!patientId) {
            setMessage(
                "Patient information not found."
            );
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const response = await axios.post(
                `${BACKEND_URL}/api/interview/save-answer`,
                {
                    patientId,
                    question,
                    answer: answer.trim()
                }
            );

            const updatedAnswers =
                response.data?.answers || [];

            setAnswers(updatedAnswers);
            setAnswer("");

            if (response.data?.completed) {
                setCompleted(true);
                setQuestion("");

                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                return;
            }

            await getNextQuestion(
                updatedAnswers
            );

        } catch (error) {
            console.error(
                "Save answer error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to save your answer."
            );

        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // VOICE INPUT
    // ==========================================

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setMessage(
                "Voice recognition is not supported in this browser. Please use Google Chrome."
            );
            return;
        }

        if (listening || saving) {
            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang =
            getSpeechLanguage();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setListening(true);
            setMessage("");
        };

        recognition.onresult = (event) => {
            const transcript =
                event.results?.[0]?.[0]?.transcript;

            if (transcript) {
                setAnswer(transcript);

                setMessage(
                    "Voice answer captured successfully."
                );
            }
        };

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            setListening(false);

            setMessage(
                "Could not understand your voice. Please try again."
            );
        };

        recognition.onend = () => {
            setListening(false);
        };

        try {
            recognition.start();
        } catch (error) {
            console.error(
                "Speech recognition start error:",
                error
            );

            setListening(false);

            setMessage(
                "Could not start voice recognition."
            );
        }
    };

    // ==========================================
    // REPEAT QUESTION
    // ==========================================

    const repeatQuestion = () => {
        speakQuestion(question);
    };

    // ==========================================
    // DOCUMENTS
    // ==========================================

    const handleUploadDocuments = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        navigate("/patient/documents");
    };

    const handleSkip = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        navigate("/patient");
    };

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (
        loading &&
        !question &&
        !completed
    ) {
        return (
            <div className="interview-page">

                <style>{`
                    ${styles}
                `}</style>

                <nav className="interview-navbar">

                    <div className="interview-brand">

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

                    <div className="language-pill">
                        🌐 {language}
                    </div>

                </nav>

                <main className="loading-container">

                    <div className="loading-card">

                        <div className="loading-orb">
                            🧠
                        </div>

                        <h2>
                            Preparing your interview
                        </h2>

                        <p>
                            We're preparing your first
                            health question.
                        </p>

                        <div className="loading-line">
                            <span></span>
                        </div>

                    </div>

                </main>

            </div>
        );
    }

    // ==========================================
    // COMPLETED SCREEN
    // ==========================================

    if (completed) {
        return (
            <div className="interview-page">

                <style>{`
                    ${styles}
                `}</style>

                <nav className="interview-navbar">

                    <div className="interview-brand">

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

                    <div className="language-pill">
                        🌐 {language}
                    </div>

                </nav>

                <main className="completion-container">

                    <div className="completion-card">

                        <div className="success-icon">
                            ✓
                        </div>

                        <div className="completion-label">
                            INTERVIEW COMPLETE
                        </div>

                        <h1>
                            Your health interview is complete
                        </h1>

                        <p className="completion-patient">
                            Thank you, {patientName}. Your
                            information has been recorded securely.
                        </p>

                        <p className="completion-description">
                            Your responses have been recorded
                            successfully. You can now add previous
                            medical reports so MediKiosk can
                            organize them for doctor review.
                        </p>

                        <div className="completion-steps">

                            <div className="completed-step">

                                <span>
                                    ✓
                                </span>

                                Patient information

                            </div>

                            <div className="completed-step">

                                <span>
                                    ✓
                                </span>

                                Health interview

                            </div>

                            <div className="next-step">

                                <span>
                                    3
                                </span>

                                Medical documents

                            </div>

                        </div>

                        <div className="documents-prompt">

                            <div className="document-icon">
                                📄
                            </div>

                            <div>

                                <h3>
                                    Do you have previous reports?
                                </h3>

                                <p>
                                    Upload prescriptions, test
                                    reports, scan copies or other
                                    medical documents. MediKiosk
                                    can extract and organize the
                                    information for doctor review.
                                </p>

                            </div>

                        </div>

                        {message && (
                            <div className="info-message">
                                ⚠️ {message}
                            </div>
                        )}

                        <button
                            type="button"
                            className="primary-action"
                            onClick={
                                handleUploadDocuments
                            }
                        >
                            <span>
                                📄
                            </span>

                            Upload Medical Documents

                            <strong>
                                →
                            </strong>

                        </button>

                        <button
                            type="button"
                            className="secondary-action"
                            onClick={handleSkip}
                        >
                            Skip for now
                        </button>

                    </div>

                </main>

                <footer className="interview-footer">

                    🔒 Your information is securely stored.
                    AI-generated information is intended for
                    doctor review.

                </footer>

            </div>
        );
    }

    // ==========================================
    // MAIN INTERVIEW
    // ==========================================

    return (
        <div className="interview-page">

            <style>{`
                ${styles}
            `}</style>

            <nav className="interview-navbar">

                <div className="interview-brand">

                    <div className="brand-logo">
                        +
                    </div>

                    <div>
                        <strong>
                            MediKiosk
                        </strong>

                        <span>
                            Patient Health Interview
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

            <main className="interview-container">

                <div className="interview-header">

                    <div>

                        <div className="small-label">
                            HEALTH INTERVIEW
                        </div>

                        <h1>
                            Tell us how you're feeling
                        </h1>

                        <p>
                            Answer naturally. You can type
                            or speak your response.
                        </p>

                    </div>

                    <div className="progress-number">

                        <strong>
                            {currentQuestion}
                        </strong>

                        <span>
                            / {totalQuestions}
                        </span>

                    </div>

                </div>

                <div className="progress-area">

                    <div className="progress-track">

                        <div
                            className="progress-fill"
                            style={{
                                width:
                                    `${Math.max(
                                        progress,
                                        8
                                    )}%`
                            }}
                        />

                    </div>

                    <div className="progress-text">
                        Question {currentQuestion} of{" "}
                        {totalQuestions}
                    </div>

                </div>

                <section className="question-card">

                    <div className="question-top">

                        <div className="ai-label">

                            <span>
                                ✦
                            </span>

                            AI-ASSISTED INTERVIEW

                        </div>

                        <button
                            type="button"
                            className="repeat-button"
                            onClick={repeatQuestion}
                            disabled={!question}
                        >
                            🔊 Repeat question
                        </button>

                    </div>

                    <div className="question-content">

                        <div className="question-number">
                            Q{currentQuestion}
                        </div>

                        <h2>
                            {question}
                        </h2>

                    </div>

                    <div
                        className={
                            listening
                                ? "voice-box listening"
                                : "voice-box"
                        }
                    >

                        <button
                            type="button"
                            className={
                                listening
                                    ? "mic-button active"
                                    : "mic-button"
                            }
                            onClick={
                                startListening
                            }
                            disabled={
                                listening ||
                                saving
                            }
                        >

                            {listening ? (

                                <span className="mic-waves">

                                    <i></i>
                                    <i></i>
                                    <i></i>

                                </span>

                            ) : (
                                "🎙️"
                            )}

                        </button>

                        <div className="voice-content">

                            <strong>
                                {listening
                                    ? "Listening..."
                                    : "Prefer to speak?"}
                            </strong>

                            <span>
                                {listening
                                    ? "Speak your answer clearly."
                                    : "Tap the microphone and answer naturally."}
                            </span>

                        </div>

                        {!listening && (
                            <span className="voice-hint">
                                Voice
                            </span>
                        )}

                    </div>

                    <div className="answer-area">

                        <div className="answer-label">

                            <span>
                                Your answer
                            </span>

                            <small>
                                Voice or text
                            </small>

                        </div>

                        <textarea
                            value={answer}
                            onChange={(e) =>
                                setAnswer(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                            placeholder="Type your answer here..."
                            rows="6"
                        />

                        <div className="answer-bottom">

                            <span>
                                {answer.length} characters
                            </span>

                            <button
                                type="button"
                                className="continue-button"
                                onClick={
                                    handleSubmitAnswer
                                }
                                disabled={
                                    saving ||
                                    !answer.trim()
                                }
                            >

                                {saving
                                    ? "Saving..."
                                    : "Continue"}

                                <span>
                                    →
                                </span>

                            </button>

                        </div>

                    </div>

                    {message && (
                        <div className="interview-message">

                            <span>
                                ⚠️
                            </span>

                            {message}

                        </div>
                    )}

                </section>

                <div className="interview-trust">

                    <div>

                        🔒

                        <span>
                            Your information is securely
                            stored for your medical case.
                        </span>

                    </div>

                    <div>

                        👨‍⚕️

                        <span>
                            A doctor will review the
                            information before making
                            clinical decisions.
                        </span>

                    </div>

                </div>

            </main>

            <footer className="interview-footer">
                MediKiosk • AI-assisted documentation
            </footer>

        </div>
    );
}

// ==========================================
// COMPLETE STYLES
// ==========================================

const styles = `

* {
    box-sizing: border-box;
}

.interview-page {
    min-height: 100vh;
    background:
        radial-gradient(
            circle at 10% 10%,
            rgba(37, 99, 235, 0.07),
            transparent 25%
        ),
        radial-gradient(
            circle at 90% 30%,
            rgba(13, 148, 136, 0.07),
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

/* ================= NAVBAR ================= */

.interview-navbar {
    height: 74px;
    padding: 0 6%;

    background: rgba(
        255,
        255,
        255,
        0.94
    );

    border-bottom: 1px solid #e4eaf0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    position: sticky;
    top: 0;

    z-index: 20;

    backdrop-filter: blur(14px);
}

.interview-brand {
    display: flex;
    align-items: center;
    gap: 11px;
}

.brand-logo {
    width: 40px;
    height: 40px;

    border-radius: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #0f766e
        );

    color: white;

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

.interview-brand strong,
.interview-brand span {
    display: block;
}

.interview-brand strong {
    font-size: 18px;
    letter-spacing: -0.4px;
}

.interview-brand span {
    margin-top: 1px;
    font-size: 10px;
    color: #8792a1;
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
    border: 1px solid #dce5ed;
    background: white;

    padding: 8px 12px;

    border-radius: 999px;

    color: #536174;

    font-size: 11px;
    font-weight: 600;
}

/* ================= INTERVIEW ================= */

.interview-container {
    width: min(850px, 92%);

    margin: 0 auto;

    flex: 1;

    padding: 55px 0 35px;
}

.interview-header {
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

.interview-header h1 {
    margin: 0;

    font-size: 34px;
    line-height: 1.15;

    letter-spacing: -1.3px;
}

.interview-header p {
    margin: 9px 0 0;

    color: #7c8796;

    font-size: 13px;
}

.progress-number {
    white-space: nowrap;

    color: #9aa4b1;
}

.progress-number strong {
    font-size: 30px;

    color: #2563eb;
}

.progress-number span {
    font-size: 13px;
}

/* ================= PROGRESS ================= */

.progress-area {
    margin-top: 32px;
}

.progress-track {
    width: 100%;
    height: 6px;

    border-radius: 999px;

    background: #e5ebf1;

    overflow: hidden;
}

.progress-fill {
    height: 100%;

    border-radius: inherit;

    background:
        linear-gradient(
            90deg,
            #2563eb,
            #0f766e
        );

    transition:
        width 0.35s ease;
}

.progress-text {
    margin-top: 8px;

    text-align: right;

    font-size: 10px;

    color: #929daa;
}

/* ================= QUESTION CARD ================= */

.question-card {
    margin-top: 25px;

    background: white;

    border: 1px solid #e1e8ef;

    border-radius: 23px;

    padding: 28px;

    box-shadow:
        0 20px 55px
        rgba(
            31,
            55,
            80,
            0.08
        );
}

.question-top {
    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 15px;
}

.ai-label {
    color: #2563eb;

    font-size: 9px;

    font-weight: 800;

    letter-spacing: 1px;
}

.ai-label span {
    margin-right: 5px;
}

.repeat-button {
    border: 1px solid #e1e8ef;

    background: #f9fbfd;

    color: #667386;

    border-radius: 8px;

    padding: 8px 11px;

    font-size: 10px;

    cursor: pointer;
}

.repeat-button:hover {
    border-color: #a8c2ea;
    color: #2563eb;
}

.question-content {
    margin: 36px 5px 32px;
}

.question-number {
    color: #9aa4b1;

    font-size: 11px;

    font-weight: 700;

    margin-bottom: 9px;
}

.question-content h2 {
    margin: 0;

    max-width: 720px;

    font-size: 29px;

    line-height: 1.3;

    letter-spacing: -0.7px;
}

/* ================= VOICE ================= */

.voice-box {
    border: 1px solid #dce9ed;

    background:
        linear-gradient(
            100deg,
            #f2faf9,
            #f5f9ff
        );

    border-radius: 15px;

    padding: 15px;

    display: flex;

    align-items: center;

    gap: 13px;

    transition: all 0.25s ease;
}

.voice-box.listening {
    border-color: #80c8bf;

    box-shadow:
        0 0 0 4px
        rgba(
            15,
            118,
            110,
            0.07
        );
}

.mic-button {
    width: 48px;
    height: 48px;

    border: none;

    border-radius: 13px;

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

    font-size: 19px;

    cursor: pointer;

    box-shadow:
        0 7px 16px
        rgba(
            37,
            99,
            235,
            0.18
        );

    flex-shrink: 0;
}

.mic-button:hover:not(:disabled) {
    transform: translateY(-1px);
}

.mic-button:disabled {
    cursor: not-allowed;
    opacity: 0.75;
}

.mic-button.active {
    background: #dc2626;
}

.voice-content {
    flex: 1;
}

.voice-content strong,
.voice-content span {
    display: block;
}

.voice-content strong {
    font-size: 12px;
}

.voice-content span {
    margin-top: 3px;

    color: #7d8997;

    font-size: 10px;
}

.voice-hint {
    color: #8a96a4;

    font-size: 10px;

    padding-right: 4px;
}

.mic-waves {
    display: flex;

    align-items: center;

    gap: 3px;

    height: 20px;
}

.mic-waves i {
    display: block;

    width: 3px;

    height: 10px;

    background: white;

    border-radius: 3px;

    animation:
        voiceWave 0.7s infinite
        alternate;
}

.mic-waves i:nth-child(2) {
    animation-delay: 0.2s;
    height: 17px;
}

.mic-waves i:nth-child(3) {
    animation-delay: 0.4s;
    height: 12px;
}

@keyframes voiceWave {
    from {
        transform: scaleY(0.6);
    }

    to {
        transform: scaleY(1.2);
    }
}

/* ================= ANSWER ================= */

.answer-area {
    margin-top: 24px;
}

.answer-label {
    display: flex;

    align-items: center;

    justify-content: space-between;

    margin-bottom: 9px;
}

.answer-label span {
    font-size: 12px;

    font-weight: 750;

    color: #354153;
}

.answer-label small {
    color: #9aa4b1;

    font-size: 9px;
}

.answer-area textarea {
    width: 100%;

    border: 1px solid #dce3ea;

    background: #fcfdfe;

    border-radius: 13px;

    padding: 15px;

    resize: vertical;

    outline: none;

    color: #172033;

    font-size: 13px;

    line-height: 1.6;

    font-family: inherit;

    min-height: 135px;

    transition: all 0.2s ease;
}

.answer-area textarea:focus {
    background: white;

    border-color: #76a0e6;

    box-shadow:
        0 0 0 4px
        rgba(
            37,
            99,
            235,
            0.07
        );
}

.answer-area textarea::placeholder {
    color: #a5aeba;
}

.answer-bottom {
    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-top: 10px;
}

.answer-bottom > span {
    color: #a0a9b5;

    font-size: 9px;
}

.continue-button {
    border: none;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
        );

    color: white;

    padding: 12px 18px;

    border-radius: 10px;

    font-size: 11px;

    font-weight: 750;

    cursor: pointer;

    display: flex;

    align-items: center;

    gap: 12px;

    box-shadow:
        0 7px 17px
        rgba(
            37,
            99,
            235,
            0.18
        );
}

.continue-button span {
    font-size: 15px;
}

.continue-button:hover:not(:disabled) {
    transform: translateY(-1px);
}

.continue-button:disabled {
    opacity: 0.45;

    cursor: not-allowed;

    box-shadow: none;
}

/* ================= MESSAGES ================= */

.interview-message {
    margin-top: 15px;

    padding: 11px 13px;

    border-radius: 9px;

    background: #fff8e8;

    border: 1px solid #f5dfad;

    color: #806321;

    font-size: 10px;

    display: flex;

    gap: 8px;
}

.info-message {
    padding: 10px;

    border-radius: 8px;

    background: #fff8e8;

    color: #806321;

    font-size: 10px;

    margin-bottom: 15px;
}

/* ================= TRUST ================= */

.interview-trust {
    display: flex;

    justify-content: center;

    gap: 35px;

    margin-top: 22px;

    color: #8994a2;
}

.interview-trust div {
    display: flex;

    align-items: center;

    gap: 7px;

    font-size: 9px;
}

/* ================= FOOTER ================= */

.interview-footer {
    text-align: center;

    color: #8f9aa8;

    font-size: 9px;

    padding: 20px;
}

/* ================= LOADING ================= */

.loading-container {
    flex: 1;

    display: flex;

    justify-content: center;

    align-items: center;

    padding: 30px;
}

.loading-card {
    width: min(430px, 100%);

    background: white;

    border: 1px solid #e1e8ef;

    border-radius: 22px;

    padding: 40px;

    text-align: center;

    box-shadow:
        0 20px 50px
        rgba(
            31,
            55,
            80,
            0.08
        );
}

.loading-orb {
    width: 65px;
    height: 65px;

    border-radius: 20px;

    background: #edf5ff;

    display: flex;

    align-items: center;

    justify-content: center;

    margin: 0 auto 20px;

    font-size: 27px;
}

.loading-card h2 {
    margin: 0;

    font-size: 22px;
}

.loading-card p {
    color: #8792a1;

    font-size: 12px;

    margin: 8px 0 24px;
}

.loading-line {
    height: 5px;

    border-radius: 999px;

    background: #e8edf2;

    overflow: hidden;
}

.loading-line span {
    display: block;

    height: 100%;

    width: 35%;

    background:
        linear-gradient(
            90deg,
            #2563eb,
            #0f766e
        );

    border-radius: inherit;

    animation:
        loadingMove 1.2s infinite;
}

@keyframes loadingMove {

    0% {
        transform: translateX(-110%);
    }

    100% {
        transform: translateX(320%);
    }
}

/* ================= COMPLETION ================= */

.completion-container {
    flex: 1;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 50px 20px;
}

.completion-card {
    width: min(700px, 100%);

    background: white;

    border: 1px solid #e1e8ef;

    border-radius: 28px;

    padding: 45px;

    text-align: center;

    box-shadow:
        0 25px 70px
        rgba(
            31,
            55,
            80,
            0.10
        );
}

.success-icon {
    width: 70px;
    height: 70px;

    margin: 0 auto 18px;

    border-radius: 50%;

    background:
        linear-gradient(
            135deg,
            #dcfce7,
            #ecfdf5
        );

    color: #15803d;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 32px;

    font-weight: 800;

    box-shadow:
        0 10px 25px
        rgba(
            22,
            163,
            74,
            0.12
        );
}

.completion-label {
    color: #15803d;

    font-size: 9px;

    letter-spacing: 1.5px;

    font-weight: 800;
}

.completion-card h1 {
    margin: 10px 0 0;

    color: #15283c;

    font-size: 32px;

    letter-spacing: -1.1px;

    line-height: 1.2;
}

.completion-patient {
    margin: 10px 0 0;

    color: #526174;

    font-size: 13px;

    font-weight: 600;
}

.completion-description {
    color: #7d8997;

    font-size: 13px;

    line-height: 1.65;

    max-width: 520px;

    margin: 10px auto 30px;
}

/* ================= STEPS ================= */

.completion-steps {
    display: flex;

    justify-content: center;

    gap: 8px;

    margin-bottom: 28px;
}

.completed-step,
.next-step {
    padding: 10px 13px;

    border-radius: 10px;

    font-size: 9px;

    font-weight: 650;

    background: #f6f8fa;

    color: #748092;

    border: 1px solid #edf0f3;
}

.completed-step span {
    color: #16a34a;

    margin-right: 5px;
}

.next-step {
    background: #eff6ff;

    border-color: #d9eaff;

    color: #2563eb;
}

.next-step span {
    margin-right: 5px;
}

/* ================= DOCUMENT PROMPT ================= */

.documents-prompt {
    text-align: left;

    display: flex;

    align-items: flex-start;

    gap: 15px;

    background:
        linear-gradient(
            135deg,
            #f1f7ff,
            #f4fbfa
        );

    border: 1px solid #dbeaf7;

    border-radius: 17px;

    padding: 19px;

    margin-bottom: 20px;
}

.document-icon {
    width: 46px;
    height: 46px;

    border-radius: 13px;

    background: white;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 21px;

    flex-shrink: 0;

    box-shadow:
        0 5px 15px
        rgba(
            31,
            55,
            80,
            0.06
        );
}

.documents-prompt h3 {
    margin: 0;

    color: #26384c;

    font-size: 14px;
}

.documents-prompt p {
    margin: 6px 0 0;

    color: #748193;

    font-size: 10px;

    line-height: 1.6;
}

/* ================= ACTION BUTTON ================= */

.primary-action {
    width: 100%;

    border: none;

    border-radius: 12px;

    padding: 15px;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
        );

    color: white;

    font-size: 12px;

    font-weight: 750;

    cursor: pointer;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 10px;

    box-shadow:
        0 9px 20px
        rgba(
            37,
            99,
            235,
            0.20
        );

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.primary-action strong {
    font-size: 17px;
}

.primary-action:hover {
    transform: translateY(-2px);

    box-shadow:
        0 12px 25px
        rgba(
            37,
            99,
            235,
            0.25
        );
}

.secondary-action {
    border: none;

    background: transparent;

    color: #7b8796;

    margin-top: 14px;

    font-size: 10px;

    cursor: pointer;
}

.secondary-action:hover {
    color: #2563eb;
}

/* ================= RESPONSIVE ================= */

@media (max-width: 650px) {

    .interview-navbar {
        padding: 0 5%;
    }

    .patient-name {
        display: none;
    }

    .interview-container {
        width: 90%;

        padding-top: 35px;
    }

    .interview-header {
        align-items: flex-start;
    }

    .interview-header h1 {
        font-size: 28px;
    }

    .progress-number {
        display: none;
    }

    .question-card {
        padding: 20px;
    }

    .question-top {
        align-items: flex-start;
    }

    .question-content {
        margin-top: 28px;
    }

    .question-content h2 {
        font-size: 23px;
    }

    .voice-hint {
        display: none;
    }

    .interview-trust {
        flex-direction: column;

        align-items: center;

        gap: 10px;
    }

    .completion-card {
        padding: 30px 20px;
    }

    .completion-card h1 {
        font-size: 27px;
    }

    .completion-steps {
        flex-wrap: wrap;
    }

    .documents-prompt {
        padding: 15px;
    }

}
`;

export default Interview;