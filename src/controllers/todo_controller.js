import { asyncHandler } from "../utils/AsyncHandler.js";
import { Todo } from "../models/todo.model.js";

// 🟢 Get all todos for logged-in user
export const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.getTodosByUser(req.user._id);
  res.status(200).json(todos); // frontend expects an array
});

// 🟢 Create a new todo
export const createTodo = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    res.status(400);
    throw new Error("Title is required");
  }

  const newTodo = await Todo.createTodoForUser(req.user._id, title.trim());
  res.status(201).json(newTodo); // return just the todo object
});

// 🟢 Update todo
export const updateTodo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const existingTodo = await Todo.findOne({ _id: id, owner: req.user._id });
  if (!existingTodo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  if (existingTodo.completed) {
    res.status(400);
    throw new Error("Cannot edit a completed Todo");
  }

  const updatedTodo = await Todo.updateTodoByUser(req.user._id, id, updates);
  res.status(200).json(updatedTodo);
});

// 🟢 Mark todo as complete
export const completeTodo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingTodo = await Todo.findOne({ _id: id, owner: req.user._id });
  if (!existingTodo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  if (existingTodo.completed) {
    res.status(400);
    throw new Error("Todo already completed");
  }

  existingTodo.completed = true;
  await existingTodo.save();

  res.status(200).json(existingTodo);
});

// 🟢 Delete todo
export const deleteTodo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Todo.deleteTodoByUser(req.user._id, id);

  if (!deleted) {
    res.status(404);
    throw new Error("Todo not found or not authorized");
  }

  res.status(200).json({ message: "Todo deleted successfully" });
});
