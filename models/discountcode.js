import mongoose from "mongoose";

const DiscountUsageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },

    used_at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

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
      enum: ["percentage", "flat"],
      required: true
    },

    discount_value: {
      type: Number,
      required: true
    },

    max_discount_amount: {
      type: Number,
      default: null
    },

    min_order_amount: {
      type: Number,
      default: 0
    },

    // Total times coupon can be used
    usage_limit: {
      type: Number,
      default: null
    },

    // Current usage count
    used_count: {
      type: Number,
      default: 0
    },

    // Limit per user (ex: 2 times)
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
    },

    used_by_users: [DiscountUsageSchema]
  },
  { timestamps: true }
);


// Index for faster lookup
DiscountCodeSchema.index({ code: 1 });
DiscountCodeSchema.index({ valid_until: 1 });


// Method to check if coupon is valid
DiscountCodeSchema.methods.isValidCoupon = function (orderAmount) {

  const now = new Date();

  if (!this.is_active) return false;

  if (now < this.valid_from || now > this.valid_until) return false;

  if (this.min_order_amount && orderAmount < this.min_order_amount) return false;

  if (this.usage_limit && this.used_count >= this.usage_limit) return false;

  return true;
};


// Method to check user usage limit
DiscountCodeSchema.methods.canUserUse = function (userId) {

  const usage = this.used_by_users.filter(
    (u) => u.user_id.toString() === userId.toString()
  ).length;

  return usage < this.per_user_limit;
};


const DiscountCode = mongoose.model("DiscountCode", DiscountCodeSchema);

export default DiscountCode;