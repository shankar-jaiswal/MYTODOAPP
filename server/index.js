import express from 'express';
import cors from 'cors';
import todoRouter from './router/todoRouter.js';
import userRouter from './router/userRouter.js';
import {ApiError} from './helper/ApiError.js';


const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', todoRouter);
app.use('/user', userRouter);
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    
    return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
