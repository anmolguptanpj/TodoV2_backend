import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Static methods
todoSchema.statics.getTodosByUser = async function (userId) {
  return await this.find({ owner: userId }).sort({ createdAt: -1 });
};

todoSchema.statics.createTodoForUser = async function (userId, title) {
  return await this.create({ title, owner: userId });
};

todoSchema.statics.deleteTodoByUser = async function (userId, todoId) {
  return await this.findOneAndDelete({ _id: todoId, owner: userId });
};

todoSchema.statics.updateTodoByUser = async function (userId, todoId, updates) {
  return await this.findOneAndUpdate(
    { _id: todoId, owner: userId },
    updates,
    { new: true, runValidators: true }
  );
};

export const Todo = mongoose.model("Todo", todoSchema);
