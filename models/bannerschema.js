import mongoose from "mongoose";


const Bannerschema=new mongoose.Schema({
    banner:{
        type:String
    },
    header:{
        type:String
    },
    subHeader:{
        type:String
    }
})

const Banner=mongoose.model('banner',Bannerschema)

export default Banner