import { Request, Response, NextFunction } from 'express';
import CustomError from './errorHandler.js';

const ErrorFormater = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof CustomError) {
        const { message, statusCode } = error.toObject();
        res.status(statusCode).json({ message, statusCode });
    } else {
        res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
    }
    next()
};



export { ErrorFormater };