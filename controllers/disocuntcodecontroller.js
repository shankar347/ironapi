import DiscountCode from "../models/discountcode.js";
import Order from "../models/orderschema.js";


// CREATE DISCOUNT CODE
const Createdisocutncode = async (req, res) => {
  try {

    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      per_user_limit,
      valid_from,
      valid_until
    } = req.body;

    const existing = await DiscountCode.findOne({ code });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists"
      });
    }

    const coupon = new DiscountCode({
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      per_user_limit,
      valid_from,
      valid_until
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Discount coupon created successfully",
      data: coupon
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// GET ALL COUPONS FOR USER (RESPECT USER LIMIT)
const getAllDiscountCouponsForUser = async (req, res) => {
  try {

    const userId = req.user.id;

    const coupons = await DiscountCode.find({
      is_active: true
    });

    const availableCoupons = [];

    for (let coupon of coupons) {

      const usageCount = await Order.countDocuments({
        userid: userId,
        discount_code: coupon.code
      });

      if (usageCount < coupon.per_user_limit) {

        const now = new Date();

        if (now >= coupon.valid_from && now <= coupon.valid_until) {
          availableCoupons.push(coupon);
        }

      }

    }

    res.status(200).json({
      success: true,
      coupons: availableCoupons
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// GET COUPON BY ID
const getDiscountCouponById = async (req, res) => {
  try {

    const { id } = req.params;

    const coupon = await DiscountCode.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// UPDATE COUPON
const updateDiscountCoupon = async (req, res) => {
  try {

    const { id } = req.params;

    const updatedCoupon = await DiscountCode.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// DELETE COUPON
const deleteDiscountCoupon = async (req, res) => {
  try {

    const { id } = req.params;

    const coupon = await DiscountCode.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



export {
  Createdisocutncode,
  getAllDiscountCouponsForUser,
  getDiscountCouponById,
  updateDiscountCoupon,
  deleteDiscountCoupon
};