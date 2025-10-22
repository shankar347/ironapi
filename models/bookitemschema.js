import mongoose from "mongoose";


const Itemschema=new mongoose.Schema({
    name:{
        type:String,
    },
    price:{
        type:String
    }
},{timestamps:true})



const Bookitem=mongoose.model('bookitem',Itemschema)

export default Bookitem