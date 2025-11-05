import mongoose from "mongoose";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js'


dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{
    app.on("error",()=>{console.log("Error:",error);throw error});
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MOngo DB COnnection failed")
}
)
