const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");


// ======================================================
// DOCTOR REGISTER
// ======================================================

const registerDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingDoctor =
            await Doctor.findOne({ email });

        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: "Doctor already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email
            }
        });

    } catch (error) {
        console.error(
            "Doctor registration error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Doctor registration failed"
        });
    }
};


// ======================================================
// DOCTOR LOGIN
// ======================================================

const loginDoctor = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const doctor =
            await Doctor.findOne({ email });

        if (!doctor) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                doctor.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token =
            jwt.sign(
                {
                    doctorId: doctor._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

        res.status(200).json({
            success: true,
            message: "Doctor login successful",
            token,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email
            }
        });

    } catch (error) {
        console.error(
            "Doctor login error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Doctor login failed"
        });
    }
};


module.exports = {
    registerDoctor,
    loginDoctor
};