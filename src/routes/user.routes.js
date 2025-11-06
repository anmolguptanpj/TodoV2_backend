import  {Router} from "express"
import {refreshAccessToken,registerUser,loginUser,logoutUser} from "../controllers/user_controller.js"
import { verifyJWT } from "../middlewares/auth_middleware.js";

const router = Router()


router.post("/register", registerUser);
router.post("/login",loginUser );
router.post("/refresh-token",refreshAccessToken);

router.post("/logout",verifyJWT,logoutUser)






export default router