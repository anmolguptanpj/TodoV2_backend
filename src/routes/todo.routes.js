import  {Router} from "express"
import {getTodos,createTodo,updateTodo,completeTodo, deleteTodo} from "../controllers/todo_controller.js"
import { verifyJWT } from "../middlewares/auth_middleware.js"

const router = Router()

router.use(verifyJWT)

router.get("/",getTodos);

router.post("/",createTodo);
router.put("/:id",updateTodo);
router.patch("/:id/complete",completeTodo);
router.delete("/:id",deleteTodo);










export default Router