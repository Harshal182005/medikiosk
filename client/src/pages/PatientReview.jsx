
import React from "react";
import { useNavigate } from "react-router-dom";

const PatientReview = () => {
    const navigate = useNavigate();

    const patientName =
        localStorage.getItem("patientName") || "Patient";

    const handleDone = () => {
        localStorage.removeItem("patientId");
        localStorage.removeItem("patientName");
        localStorage.removeItem("preferredLanguage");

        navigate("/");
    };

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Inter, Arial, sans-serif;
                    background: #f5f8fc;
                    color: #172033;
                }

                .review-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px 20px;
                }

                .review-card {
                    width: 100%;
                    max-width: 680px;
                    background: white;
                    border-radius: 24px;
                    padding: 48px;
                    text-align: center;
                    box-shadow: 0 18px 50px rgba(20, 40, 80, 0.10);
                }

                .success-icon {
                    width: 82px;
                    height: 82px;
                    margin: 0 auto 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e8f8ef;
                    color: #16834a;
                    font-size: 40px;
                    font-weight: 700;
                }

                .brand {
                    font-size: 15px;
                    font-weight: 700;
                    color: #2563eb;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                h1 {
                    margin: 0 0 12px;
                    font-size: 32px;
                    color: #172033;
                }

                .welcome {
                    margin: 0 auto 30px;
                    max-width: 500px;
                    color: #657086;
                    line-height: 1.7;
                    font-size: 16px;
                }

                .status-box {
                    background: #f7f9fc;
                    border: 1px solid #e4e9f1;
                    border-radius: 16px;
                    padding: 22px;
                    margin-bottom: 26px;
                    text-align: left;
                }

                .status-title {
                    font-size: 13px;
                    color: #7b8495;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                    font-weight: 700;
                }

                .status {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #16834a;
                    font-size: 17px;
                    font-weight: 700;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #20a35a;
                }

                .steps {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 30px;
                }

                .step {
                    padding: 15px 10px;
                    border-radius: 12px;
                    background: #f4f7fb;
                    color: #566176;
                    font-size: 13px;
                    font-weight: 600;
                }

                .step.completed {
                    background: #edf8f2;
                    color: #16834a;
                }

                .button {
                    width: 100%;
                    border: none;
                    border-radius: 13px;
                    padding: 15px 20px;
                    background: #2563eb;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .button:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                .note {
                    margin-top: 20px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #8a93a3;
                }

                @media (max-width: 600px) {
                    .review-card {
                        padding: 32px 22px;
                        border-radius: 18px;
                    }

                    h1 {
                        font-size: 26px;
                    }

                    .steps {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="review-page">
                <div className="review-card">

                    <div className="success-icon">
                        ✓
                    </div>

                    <div className="brand">
                        MEDIKIOSK
                    </div>

                    <h1>
                        Your Case Has Been Submitted
                    </h1>

                    <p className="welcome">
                        Thank you, {patientName}. Your interview
                        responses and uploaded medical documents
                        have been successfully submitted for
                        doctor review.
                    </p>

                    <div className="status-box">
                        <div className="status-title">
                            Case Status
                        </div>

                        <div className="status">
                            <span className="status-dot"></span>
                            Pending Doctor Review
                        </div>
                    </div>

                    <div className="steps">
                        <div className="step completed">
                            ✓ Registration
                        </div>

                        <div className="step completed">
                            ✓ AI Interview
                        </div>

                        <div className="step completed">
                            ✓ Documents Submitted
                        </div>
                    </div>

                    <button
                        className="button"
                        onClick={handleDone}
                    >
                        Done
                    </button>

                    <p className="note">
                        Your information will be reviewed by a
                        doctor. AI-generated information is for
                        documentation support only and does not
                        replace professional medical judgment.
                    </p>

                </div>
            </div>
        </>
    );
};

export default PatientReview;
