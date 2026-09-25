const express = require("express");

const {
    registerDoctor,
    loginDoctor
} = require("../controllers/doctorAuthController");

const router = express.Router();


// Doctor registration
router.post(
    "/register",
    registerDoctor
);


// Doctor login
router.post(
    "/login",
    loginDoctor
);


module.exports = router;