import mongoose from "mongoose";


const Videoschema=new mongoose.Schema({
    video:{
        type:String
    },
    name:{
        type:String,
        default:'homevideo'
    }
})

const Video=mongoose.model('video',Videoschema)

export default Video

