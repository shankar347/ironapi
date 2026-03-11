import express from "express";
import Authuser from "../middlewares/authuser.js";

import {
  Createdisocutncode,
  getAllDiscountCouponsForUser,
  getDiscountCouponById,
  updateDiscountCoupon,
  deleteDiscountCoupon
} from "../controllers/disocuntcodecontroller.js";

const router = express.Router();


// CREATE DISCOUNT COUPON (Admin / Authorized user)
router.post(
  "/createdisocuntcode",
  // Authuser,
  Createdisocutncode
);


// GET AVAILABLE COUPONS FOR USER
router.get(
  "/usercoupons",
  Authuser,
  getAllDiscountCouponsForUser
);


// GET SINGLE COUPON BY ID
router.get(
  "/coupon/:id",
  Authuser,
  getDiscountCouponById
);


// UPDATE COUPON
router.put(
  "/coupon/:id",
  Authuser,
  updateDiscountCoupon
);


// DELETE COUPON
router.delete(
  "/coupon/:id",
  Authuser,
  deleteDiscountCoupon
);


export default router;