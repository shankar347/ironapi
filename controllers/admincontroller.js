import Order from "../models/orderschema.js";
import User from "../models/userschema.js";

const getAllusers = async (req, res) => {
  try {
    const Users = await User.find({ isagent: false, isagentapplied: false });
    res
      .status(200)
      .json({ data: Users, message: "Users fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const deleteuser = async (req, res) => {
  try {
    const user = await User.findById(req?.params?.id);

    if (!user) {
      return res.status(404).json({ error: "User is not found to remove" });
    }

    await User.findByIdAndDelete(req?.body?.user_id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAllagents = async (req, res) => {
  try {
    const Agents = await User.find({ isagent: true });

    res
      .status(200)
      .json({ data: Agents, message: "Agents fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAllagentsapplied = async (req, res) => {
  try {
    const Agents = await User.find({ isagentapplied: true, isagent: false });

    res
      .status(200)
      .json({ data: Agents, message: "Agents fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getAgentorders = async (req, res) => {
  try {
    const Orders = await Order.find({ agent_id: req?.user?._id });

    res
      .status(200)
      .json({ message: "Agent orders fetched successful", data: Orders });
  } catch (error) {
    console.log(error);
  }
};

const getAgenttodayorders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch orders for today
    const Orders = await Order.find({
      agent_id: req?.user?._id,
      order_date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    res
      .status(200)
      .json({ message: "Agent today orders fetched successful", data: Orders });
  } catch (error) {
    console.log(error);
  }
};

const gettodayorders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch orders for today
    const Orders = await Order.find({
      order_date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    res
      .status(200)
      .json({ message: "Today orders fetched successful", data: Orders });
  } catch (error) {
    console.log(error);
  }
};
const acceptAgentlogin = async (req, res) => {
  try {
    const { agent_id, action } = req.body;

    const agent = await User.findById(agent_id);

    if (!agent) {
      res.status(404).json({ error: "Agent is not found" });
    }

    agent.isagent = action;

    await agent.save();

    res
      .status(200)
      .json({ message: "Agent orders fetched successful", data: agent });
  } catch (error) {
    console.log(error);
  }
};

const getAllorders = async (req, res) => {
  try {
    const Orders = await Order.find({});

    res
      .status(200)
      .json({ data: Orders, message: "Orders fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const assignAgenttoOrders = async (req, res) => {
  try {
    const { order_id, agent_id } = req.body;

    const order = await Order.findById(order_id);

    if (!order) {
      res.status(404).json({ error: "Order not found to assign Agent" });
      return;
    }

    const agent = await User.findById(agent_id);

    if (!agent) {
      return res.status(404).json({ error: "Agent not found ot assing order" });
    }

    order.agent_id = agent._id;
    order.agent_name = agent.name;
    order.agent_phoneno = agent.phoneno;

    await order.save();

    res
      .status(200)
      .json({ data: order, message: "Agent assigned to order successfully" });
  } catch (error) {
    res.json(error);
  }
};

export {
  getAllagents,
  getAllorders,
  getAllusers,
  deleteuser,
  assignAgenttoOrders,
  getAgentorders,
  getAgenttodayorders,
  acceptAgentlogin,
  getAllagentsapplied,
  gettodayorders,
};
