import mongoose from "mongoose";

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String
    },

    discount_type: {
      type: String,
      enum: ["percentage", "flat", "free_delivery", "buy_x_get_y"],
      required: true
    },

    // Used for percentage / flat
    discount_value: {
      type: Number,
      default: 0
    },

    // Used for percentage
    max_discount_amount: {
      type: Number,
      default: null
    },

    // Minimum cart amount
    min_order_amount: {
      type: Number,
      default: 0
    },

    // Buy X Get Y fields
    buy_quantity: {
      type: Number,
      default: null
    },

    free_quantity: {
      type: Number,
      default: null
    },

    // Total coupon usage
    usage_limit: {
      type: Number,
      default: null
    },

    used_count: {
      type: Number,
      default: 0
    },

    // Per user usage
    per_user_limit: {
      type: Number,
      default: 1
    },

    valid_from: {
      type: Date,
      required: true
    },

    valid_until: {
      type: Date,
      required: true
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

DiscountCodeSchema.index({ code: 1 });
DiscountCodeSchema.index({ valid_until: 1 });


// Check if coupon is valid
DiscountCodeSchema.methods.isValidCoupon = function (orderAmount) {

  const now = new Date();

  if (!this.is_active) return false;

  if (now < this.valid_from || now > this.valid_until) return false;

  if (orderAmount < this.min_order_amount) return false;

  if (this.usage_limit && this.used_count >= this.usage_limit) return false;

  return true;
};

const DiscountCode = mongoose.model("DiscountCode", DiscountCodeSchema);

export default DiscountCode;