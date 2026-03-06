// routes/payment.routes.js
import express from 'express';
import Authuser from '../middlewares/authuser.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentcontroller.js';

const router = express.Router();

router.post('/create-order', Authuser, createRazorpayOrder);
router.post('/verify', Authuser, verifyPayment);

export default router;      