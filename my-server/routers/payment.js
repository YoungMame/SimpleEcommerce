const express = require("express");

const router = express.Router();

const {
    createPaymentIntent,
    calculateTotalPrice

} = require("../controllers/payment");

const authMiddleware = require("../middlewares/auth.js");

router.post("/total-price", authMiddleware, calculateTotalPrice);

router.post("/payment-intent", authMiddleware, createPaymentIntent);

module.exports = router;
