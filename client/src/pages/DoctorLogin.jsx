import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function DoctorLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.post(
                `${BACKEND_URL}/api/doctor-auth/login`,
                {
                    email,
                    password
                }
            );

            const data = response.data;

            if (data.success) {
                localStorage.setItem(
                    "doctorToken",
                    data.token
                );

                localStorage.setItem(
                    "doctorName",
                    data.doctor.name
                );

                localStorage.setItem(
                    "doctorEmail",
                    data.doctor.email
                );

                navigate("/doctor/dashboard");
            }

        } catch (error) {
            console.error(
                "Doctor login error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Doctor login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f7fb",
                fontFamily: "Arial, sans-serif"
            }}
        >
            <div
                style={{
                    width: "400px",
                    padding: "35px",
                    background: "white",
                    borderRadius: "15px",
                    boxShadow:
                        "0 5px 20px rgba(0,0,0,0.1)"
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "10px"
                    }}
                >
                    MediKiosk
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "#666"
                    }}
                >
                    Doctor Portal
                </p>

                <h2
                    style={{
                        textAlign: "center",
                        marginTop: "25px"
                    }}
                >
                    Doctor Login
                </h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Doctor Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "20px",
                            boxSizing: "border-box",
                            border:
                                "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "15px"
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "15px",
                            boxSizing: "border-box",
                            border:
                                "1px solid #ddd",
                            borderRadius: "8px",
                            fontSize: "15px"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginTop: "20px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {message && (
                    <p
                        style={{
                            marginTop: "20px",
                            padding: "10px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            borderRadius: "8px",
                            textAlign: "center"
                        }}
                    >
                        {message}
                    </p>
                )}

                <button
                    onClick={() =>
                        navigate("/patient")
                    }
                    style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "11px",
                        background: "white",
                        color: "#2563eb",
                        border:
                            "1px solid #2563eb",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    ← Patient Portal
                </button>

            </div>
        </div>
    );
}

export default DoctorLogin;