import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUser, selectUserByEmail } from '../models/User.js';
import { ApiError } from '../helper/ApiError.js';

const postRegistration = async (req, res, next) => {
    try {
        if (!req.body.email || req.body.email.length === 0) {
            return next(new ApiError(400, 'Invalid email'));
        }
        if (!req.body.password || req.body.password.length < 8) {
            return next(new ApiError(400, 'Password must be at least 8 characters long')); // Fixed message
        }

        const hashedPassword = await hash(req.body.password, 10);
        const userFromDb = await insertUser(req.body.email, hashedPassword);

        if (userFromDb.rowCount === 0) {
            return next(new ApiError(500, 'User registration failed'));
        }

        const user = userFromDb.rows[0];
        return res.status(201).json(createUserObject(user.id, user.email));
    } catch (error) {
        console.error("Error in postRegistration:", error);
        return next(new ApiError(500, 'Registration failed'));
    }
};



const postLogin = async (req, res, next) => {
    const invalidCredentialsMessage = 'Invalid email or password';
    try {

        const userFromDb = await selectUserByEmail(req.body.email);


        if (userFromDb.rowCount === 0) {
            return next(new ApiError(401, invalidCredentialsMessage));
        }

        const user = userFromDb.rows[0];


        if (!await compare(req.body.password, user.password)) {
            return next(new ApiError(401, invalidCredentialsMessage));
        }


        const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json(createUserObject(user.id, user.email, token));
    }
    catch (error) {
        console.error("Error in postLogin:", error);
        return next(new ApiError(500, 'Login failed'));
    }
}


const createUserObject = (id, email, token = undefined) => {
    return {
        'id': id,
        'email': email,
        ...(token && { 'token': token })
    };
}

export { postRegistration, postLogin };