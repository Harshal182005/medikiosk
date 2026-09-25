import { useNavigate } from "react-router-dom";

function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="role-page">
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Inter, Arial, sans-serif;
                    background: #f6f9fc;
                }

                .role-page {
                    min-height: 100vh;
                    background:
                        radial-gradient(circle at top left, rgba(30, 136, 229, 0.10), transparent 35%),
                        radial-gradient(circle at bottom right, rgba(0, 188, 212, 0.08), transparent 35%),
                        #f6f9fc;
                    display: flex;
                    flex-direction: column;
                }

                .role-header {
                    height: 72px;
                    background: white;
                    border-bottom: 1px solid #e8edf3;
                    display: flex;
                    align-items: center;
                    padding: 0 7%;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 23px;
                    font-weight: 800;
                    color: #12304a;
                }

                .brand-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: #1677ff;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 21px;
                    font-weight: 800;
                }

                .main-content {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 60px 20px;
                }

                .content {
                    width: 100%;
                    max-width: 1050px;
                    text-align: center;
                }

                .eyebrow {
                    display: inline-block;
                    padding: 8px 14px;
                    border-radius: 30px;
                    background: #eaf3ff;
                    color: #1677ff;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 20px;
                }

                h1 {
                    margin: 0;
                    color: #102a43;
                    font-size: clamp(34px, 5vw, 54px);
                    line-height: 1.1;
                    letter-spacing: -1.5px;
                }

                .subtitle {
                    max-width: 650px;
                    margin: 18px auto 42px;
                    color: #62748a;
                    font-size: 17px;
                    line-height: 1.7;
                }

                .cards {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                    max-width: 850px;
                    margin: auto;
                }

                .role-card {
                    background: white;
                    border: 1px solid #e5ebf2;
                    border-radius: 24px;
                    padding: 38px 32px;
                    text-align: left;
                    cursor: pointer;
                    transition: 0.25s ease;
                    box-shadow: 0 12px 35px rgba(31, 50, 70, 0.06);
                }

                .role-card:hover {
                    transform: translateY(-5px);
                    border-color: #b9d8ff;
                    box-shadow: 0 18px 45px rgba(31, 50, 70, 0.11);
                }

                .role-icon {
                    width: 62px;
                    height: 62px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    margin-bottom: 22px;
                    background: #edf5ff;
                }

                .role-card h2 {
                    margin: 0 0 10px;
                    color: #17324d;
                    font-size: 25px;
                }

                .role-card p {
                    margin: 0 0 24px;
                    color: #718096;
                    line-height: 1.6;
                    font-size: 15px;
                }

                .role-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 20px;
                    border-radius: 12px;
                    background: #1677ff;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                }

                .doctor-card .role-button {
                    background: #12304a;
                }

                .footer {
                    padding: 20px;
                    text-align: center;
                    color: #8a99aa;
                    font-size: 13px;
                }

                @media (max-width: 700px) {
                    .cards {
                        grid-template-columns: 1fr;
                    }

                    .role-header {
                        padding: 0 20px;
                    }

                    .main-content {
                        padding: 40px 18px;
                    }
                }
            `}</style>

            <header className="role-header">
                <div className="brand">
                    <div className="brand-icon">M</div>
                    MediKiosk
                </div>
            </header>

            <main className="main-content">
                <div className="content">

                    <div className="eyebrow">
                        AI-Powered Patient Case Taking
                    </div>

                    <h1>
                        Welcome to MediKiosk
                    </h1>

                    <p className="subtitle">
                        Choose how you want to access the system.
                        Patients can complete their medical history,
                        while doctors can review AI-organized patient cases.
                    </p>

                    <div className="cards">

                        {/* Patient */}
                        <div
                            className="role-card"
                            onClick={() =>
                                navigate("/patient")
                            }
                        >
                            <div className="role-icon">
                                👤
                            </div>

                            <h2>
                                I'm a Patient
                            </h2>

                            <p>
                                Share your symptoms, medical history,
                                interview answers and previous medical
                                documents with the healthcare team.
                            </p>

                            <span className="role-button">
                                Continue as Patient →
                            </span>
                        </div>

                        {/* Doctor */}
                        <div
                            className="role-card doctor-card"
                            onClick={() =>
                                navigate("/doctor/login")
                            }
                        >
                            <div className="role-icon">
                                🩺
                            </div>

                            <h2>
                                I'm a Doctor
                            </h2>

                            <p>
                                Access the doctor dashboard to review
                                patient information, AI summaries,
                                documents and attention indicators.
                            </p>

                            <span className="role-button">
                                Continue as Doctor →
                            </span>
                        </div>

                    </div>
                </div>
            </main>

            <footer className="footer">
                MediKiosk • AI-assisted clinical documentation
            </footer>
        </div>
    );
}

export default RoleSelection;