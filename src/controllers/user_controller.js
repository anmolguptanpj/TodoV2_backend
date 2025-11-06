import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessandRefreshTokens = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        user.refreshToken = refreshToken
        user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch(error){
        throw new ApiError(500,"something went wrong while generating refresh and access token")

    }
}


const registerUser = asyncHandler(async(req,res)=>{
    const {firstName,lastName,username,password} = req.body

    if([firstName,lastName,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or :[{username},{email}]
    })


    const user = await User.create({
  firstName,
  lastName,
  username,
  password
});

    if(existedUser){
        throw new ApiError(409,"User with email and or username already exists")
    }

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
         }

    return res.status(201).json(new ApiResponse(200, createdUser ,"User registered Successfully"))   
})


const loginUser = asyncHandler(async(req,res)=>{
    const{email,username,password} = req.body

    if(!(username || email)){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({$or:[{username},{email}]}).select("+password");
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)


    if(!isPasswordValid){
        throw new ApiError(404,"Invalid user Credentials ")
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly:true,
        secure:true
    }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,{
            user:loggedInUser, accessToken,
            refreshToken
        },
        "User logged in SUccessfully"
    )
   )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {throw new ApiError(401,"unauthorized request")

    }

    try { const decodedToken = jwt.verify(
        incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"refresh token is expired or used")
    }

    if(incomingRefreshToken!== user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used")
    }

    const options = {
        httpOnly:true,
        secure:true
    }

    const {accessToken,refreshToken:newrefreshToken} = await generateAccessandRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("refreshToken",accessToken,options)
    .cookie("accessToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token refreshed"
        )
    )
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
        
    }
        
}
)


const logoutUser = asyncHandler(async(req,res)=>{
  await   User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    
    const options = {
    httpOnly:true,
    secure:true
   }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {},"User logged out"))
})