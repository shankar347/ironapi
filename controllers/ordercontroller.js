import Order from "../models/orderschema.js";
import User from "../models/userschema.js";

  const createorder = async (req, res) => {
    try {
      const { otherdetails, userdetails ,order_cloths } = req.body;

      const { area, city, houseno, name, phoneno, pincode, streetname } =
        userdetails;

      const { paymenttype, timeslot, totalamount, totalcloths ,
        deliverySpeed
      } = otherdetails;

      const user = req.user;

      const checkuser_registered = await User.findById(user?._id);

      if (!checkuser_registered) {
        return res.status(500).json({
          error: "Please signup to book slots",
        });
      }


      let orderid=await  Order.countDocuments({})
      
      

      const order = new Order({
        orderid,
        userid: user?._id,
        user_name: name,
        user_phoneno: phoneno,
        user_address: {
          houseno,
          streetname,
          area,
          city,
          pincode,
        },
        order_cloths,
        order_date: new Date(),
        order_totalamount: totalamount,
        order_totalcloths: totalcloths,
        order_slot: timeslot,
        order_paymenttype: paymenttype,
        order_deliveryspeed: deliverySpeed
      });

      await order.save();

      res.status(200).json({
        data: order,
        message: "Order created successfully",
      });
    } catch (error) {
      console.log(error,'err')
      res.json({ error: "Error in creating the Order" });
    }
  };

const getorder_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(order_id);

    if (!order) {
      res.status(404).json({
        error: "Given orde Id is not avilable",
      });
    }
    res.status(200).json({
      data: order,
      message: "Order fetched successfully",
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const update_flow_order = async (req, res) => {
  try {
    const { order_id, step } = req.body;

    const order = await Order.findById(order_id);

    if (!order) {
      return res
        .status(404)
        .json({ error: "The given order is expired or not found" });
    }

    if (order.agent_id.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: "You are not the assigned agent to update the Order status",
      });
    }

    const flow = order.order_flow.find((f) => f.step === step);

    if (!flow) {
      return res.status(404).json({ error: "Invalid step" });
    }

    flow.completed = true;
    flow.completedAt = new Date();

    await order.save();

    res.status(200).json({
      data: order,
      message: "Order status updted successfully",
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const get_user_orders = async (req, res) => {
  try {
    const order = await Order.find({ userid: req.user._id })
      .sort({ createdAt: -1 })
      .skip(1);

    // console.log(order)

    if (order.length === 0) {
      res.status(404).json({
        error: "No order is created for user",
      });
    }

    res.status(200).json({
      data: order,
      message: "User orders fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

const get_user_last_order = async (req, res) => {
  try {
    const last_active_order = await Order.findOne({
      userid: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      message: "Your last order fetched successfully",
      data: last_active_order,
    });
  } catch (error) {
    rs.status(500).json({
      error: "Error in fetching the given order",
    });
  }
};

export {
  createorder,
  getorder_by_id,
  update_flow_order,
  get_user_orders,
  get_user_last_order,
};
