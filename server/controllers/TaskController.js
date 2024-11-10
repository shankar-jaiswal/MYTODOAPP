import { selectAllTasks, insertTask, removeTask } from "../models/Task.js"
import { ApiError } from "../helper/ApiError.js"; 


const getTasks = async (req, res, next) => {
    try {
        const result = await selectAllTasks();
        if (result.rows) {
            res.status(200).json(result.rows);
        } else {
            throw new Error("No tasks found");
        }
    } catch (error) {
        console.error("Error in getTasks:", error); 
        return next(new ApiError(500, 'Failed to fetch tasks'));
    }
};




const postTask = async (req, res, next) => {
    try {
        if (!req.body.description || req.body.description.trim().length === 0) {
            res.status(401).json({ message: 'Invalid description for task' });
            return;
        }
        const result = await insertTask(req.body.description);
        res.status(200).json({ id: result.rows[0].id });
    } catch (error) {
        console.error("Error in postTask:", error);
        next(error);
    }
};



const deleteTask = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const result = await removeTask(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        } else {
            return res.status(200).json({ id, message: 'Task deleted successfully' });
        }
    } catch (error) {
        console.error("Error in deleteTask:", error);
        return next(new ApiError(500, 'Failed to delete task'));
    }
};



export { getTasks, postTask, deleteTask };