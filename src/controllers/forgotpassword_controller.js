import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import otpGenerator from "otp-generator"
import {asyncHandler} from "../utils/AsyncHandler.js"
import  {ApiResponse} from "../utils/ApiResponse.js"
import  {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

export const sendResetOtp = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    if(!email) throw new ApiError(400,"Email is required");

    const user = await User.findOne({email});

    if(!user) throw new ApiError(404, "No account found with this email");

    const otp = otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        specialChars: false,
    })

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; //valid for 10 mins
    await user.save({validateBeforeSave: false})

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email, 
        subject:"Your Password Reset OTP",
        html:
      ` <div style = "font-family: Arial, sans-serif; color : #333">
            <h2>Hello ${user.firstName || "User"}</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #007bff">${otp}</h1>
            <p>This OTP is valid for 10 minutes</p>
            <p>If you didnt request this. You can ignore this email.</p>
        </div>`
    };

    await transporter.sendMail(mailOptions);


    return res.status(200).json(new ApiResponse(200,{}, "OTP SENT TO EMAIL SUCCESSFULLY"))

});



export const verifyResetOtp = asyncHandler(async(req,res)=>{
    const {email, otp} = req.body;
    if(!email || !otp) throw new ApiError(400,"EMAIL AND OTP ARE REQUIRED");

    const user = await User.findOne({email});
    if(!user) throw new ApiError(404,"User not found");

    if(user.resetPasswordOTP !== otp) throw new ApiError(400, "Invalid OTP");
    if(Date.now()>user.resetPasswordExpires) throw new ApiError(400,"OTP HAS EXPIRED");

    user.isOtpVerified = true;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {}, "OTP VERIFIED SUCCESSFULLY"));
})


export const resetPassword = asyncHandler(async(req,res)=>{
    const{email,newPassword}=req.body;
    if(!email || !newPassword) throw new ApiError(400,"Email and new password are required")

    const user = await User.findOne({email});
    if(!user) throw new ApiError(404,"User not found");
    if(!user.isOtpVerified) throw new ApiError(400,"OTP Verification required");

    //Hash new password
    user.password = newPassword
    user.resetPasswordOTP=undefined;
    user.resetPasswordExpires=undefined;
    user.isOtpVerified=false;

    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));

})