import  {Router} from "express"
import {refreshAccessToken,registerUser,loginUser,logoutUser} from "../controllers/user_controller.js"
import { verifyJWT } from "../middlewares/auth_middleware.js";
import { resetPassword, sendResetOtp, verifyResetOtp } from "../controllers/forgotpassword_controller.js";

const router = Router()


router.post("/register", registerUser);
router.post("/login",loginUser );
router.post("/refresh-token",refreshAccessToken);

router.post("/logout",verifyJWT,logoutUser)
router.post("/forgot-password", sendResetOtp)
router.post("/verify-otp",verifyResetOtp)
router.post("/reset-password",resetPassword);






export default router