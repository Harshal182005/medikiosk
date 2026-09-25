const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const patientRoutes = require("./routes/patientRoutes");
const aiRoutes = require("./routes/aiRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoutes");
const documentRoutes =require("./routes/documentRoutes");
const combinedAIRoutes =require("./routes/combinedAIRoutes");
const redFlagRoutes =require("./routes/redFlagRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Patient routes
app.use("/api/patients", patientRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

// Interview routes
app.use("/api/interview", interviewRoutes);

// Voice routes
app.use("/api/voice", voiceRoutes);

// Doctor routes
app.use("/api/doctors", doctorRoutes);

// Doctor authentication routes
app.use("/api/doctor-auth", doctorAuthRoutes);

// Document routes
app.use("/api/documents", documentRoutes);

// Combined AI routes
app.use("/api/combined-ai", combinedAIRoutes);

// Red Flag routes
app.use("/api/red-flags", redFlagRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "MediKiosk Backend is running successfully"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediKiosk Server running on port ${PORT}`);
});