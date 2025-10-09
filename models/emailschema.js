import mongoose from "mongoose";


const emailschema=new mongoose.Schema({
    email:{
        type:'String'
    },
    otp:{
        type:Number
    },
    expiry:{
        type:Date
    }
})


const Email=mongoose.model('email',emailschema)

export default Email