import { Router } from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  completeTodo,
  deleteTodo,
} from "../controllers/todo_controller.js";
import { verifyJWT } from "../middlewares/auth_middleware.js";

const router = Router();

// ✅ Apply JWT protection to all todo routes
router.use(verifyJWT);

// ✅ Get all todos for logged-in user
router.get("/", getTodos);

// ✅ Create a new todo
router.post("/", createTodo);

// ✅ Update an existing todo
router.put("/:id", updateTodo);

// ✅ Mark todo as complete
router.patch("/:id/complete", completeTodo);

// ✅ Delete a todo
router.delete("/:id", deleteTodo);

export default router;
