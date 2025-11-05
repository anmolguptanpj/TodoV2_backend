import mongoose from "mongoose";


const userSchema =  new mongoose.Schema({
    firstName:{
        type:String,
        unique:false,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        unique:false,
        required:true,
        trim:true
    },
    username:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        required:true,
    },
    password:{
        type:String,
        trim:true,
        required:true
    }
},{timestamps:true})


export const User = mongoose.model("User",userSchema)