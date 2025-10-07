import express from "express";
import Authadmin from "../middlewares/authadmin.js";
import {
  acceptAgentlogin,
  assignAgenttoOrders,
  deleteuser,
  getAgentorders,
  getAgenttodayorders,
  getAllagents,
  getAllagentsapplied,
  getAllorders,
  getAllusers,
  gettodayorders,
} from "../controllers/admincontroller.js";
import Authuser from "../middlewares/authuser.js";
import Authagent from "../middlewares/authagent.js";

const Router = express.Router();

// user routes

Router.get("/allusers", Authuser, Authadmin, getAllusers);
Router.delete("/deleteusers/:id", Authuser, Authadmin, deleteuser);
Router.put("/assignagentorders", Authuser, Authadmin, assignAgenttoOrders);

// agent routes

Router.get("/allgents", Authuser, Authadmin, getAllagents);
Router.get("/allgentsapplied", Authuser, Authadmin, getAllagentsapplied);
Router.get("/getagentorders", Authuser, Authagent, getAgentorders);
Router.get("/getagenttodayorders", Authuser, Authagent, getAgenttodayorders);
Router.put("/activateagent", Authuser, Authadmin, acceptAgentlogin);

// order routes

Router.get("/allorders", Authuser, Authadmin, getAllorders);
Router.get("/alltodayorders", Authuser, Authadmin, gettodayorders);

export default Router;
