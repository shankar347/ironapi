import express from "express";
import Authadmin from "../middlewares/authadmin.js";
import {
  acceptAgentlogin,
  assignAgenttoOrders,
  deletebanner,
  deleteuser,
  Editbanners,
  getAgentorders,
  getAgenttodayorders,
  getAllagents,
  getAllagentsapplied,
  getAllorders,
  getAllusers,
  getBanners,
  gettodayorders,
  updatebanner,
  uploadHomeVideo,
} from "../controllers/admincontroller.js";
import Authuser from "../middlewares/authuser.js";
import Authagent from "../middlewares/authagent.js";
import multer from "multer";


const Router = express.Router();

const upload=multer({storage:multer.memoryStorage(),
        limits:{
                fileSize:1024*1024*15,
                fieldSize:1024*1024*15,
                fields:10 
        }
}).single('banner')

const uploadVideo=multer({storage:multer.memoryStorage(),
        limits:{
                fileSize:1024*1024*25,
        }
}).single('video')

const handlemulterupload=(req,res,next)=>{
        upload(req,res,(err)=>{
                if(err instanceof multer.MulterError){
                   if(err.code === 'LIMIT_FILE_SIZE')
                   {
                     return  res.status(200).json({error:'file size should be less than 15MB'})
                   } 
                   else if (err.code === 'LIMIT_FIELD_VALUE')
                   {
                        return res.status(200).json({error:'file size should be less than 15MB'})
                   }
                   return res.status(200).json({error:err.message})
                }
                else if(err){
                   return res.json({error: "Unknown error in uploading file"})
                }
                next()
        })
}

const handlemultervideoupload=(req,res,next)=>{
        uploadVideo(req,res,(err)=>{
                if(err instanceof multer.MulterError){
                   if(err.code === 'LIMIT_FILE_SIZE')
                   {
                     return  res.status(200).json({error:'file size should be less than 15MB'})
                   } 
                   else if (err.code === 'LIMIT_FIELD_VALUE')
                   {
                        return res.status(200).json({error:'file size should be less than 15MB'})
                   }
                   return res.status(200).json({error:err.message})
                }
                else if(err){
                   return res.json({error: "Unknown error in uploading file"})
                }
                next()
        })
}


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
Router.post('/updatebanner',Authuser,Authadmin,handlemulterupload,updatebanner)
Router.get('/getbanners',Authuser,Authadmin,getBanners)
Router.put('/editbanner/:id',Authuser,Authadmin,handlemulterupload,Editbanners)
Router.delete('/deletebanner/:id',Authuser,Authadmin,deletebanner)
Router.put('/updatevideo',Authuser,Authadmin,handlemultervideoupload,uploadHomeVideo)


export default Router;
