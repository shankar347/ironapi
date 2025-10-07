import mongoose  from "mongoose";

const Transactionschema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    order_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    username:{
        type:String
    },
    order_amount:{
        type:String
    },
    order_date:{
        type:String
    }
},{timestamps:true})



export  default Transactionschema


