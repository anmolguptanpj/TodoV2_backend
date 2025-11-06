import   { asyncHandler } from "../utils/AsyncHandler.js"
import {todo} from "../models/todo.model.js"

export const getTodos = asyncHandler(async(req,res)=>{
    const todos = await todo.getTodosByUser(req.user._id);
    res.status(200).json({
        success:true,
        count:todos.length,
        todos,
    });
});


export const createTodo = asyncHandler(async(req,res)=>{
    const {title} = req.body;
    if(!title||title.trim()=== ""){
        res.status(400);
        throw new Error("Title is required")
    }

    const newTodo = await todo.createTodoForUser(req.user._id,title);
    res.status(201).json({
        success:true,
        todo: newTodo,
    })
});


export const updateTodo = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {updates} = req.body;

    const existingTodo = await todo.findOne({_id: id, Owner : req.user._id});
    if(!existingTodo){
        res.status(404);
        throw new Error("Todo not found");

        
    }


    if(existingTodo.completed){
        res.status(400);
        throw new Error("Cannot edit a completed Todo")
    }


    const updatedTodo = await todo.updateTodoByUser(req.user._id,id,updates);

    res.status(200).json({
        success:true,
        todo: updatedTodo,
    })
})


export const completeTodo = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    const existingTodo = await todo.findOne({_id:id,Owner:req.user._id});
    if(!existingTodo){
        res.status(404);
        throw new Error("Todo not  found");
    }

    if(existingTodo.completed)
    {
        res.status(
            400
        );
        throw new Error("Todo Already Completed")
    }

    existingTodo.completed = true;
    await existingTodo.save();

    res.status(200).json({
    success:true,
    message:"Todo marked as completed",
    todo: existingTodo
    })
   
});


export const deleteTodo = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    const deleted = await todo.deleteTodoByUser(req.user._id,id);
    if(!deleted){
        res.status(404);
        throw new Error("Todo not found or not authorized");

    }

    res.status(200).json({
        success:true,
        message:"Todo deleted succcessfully"
    })
})