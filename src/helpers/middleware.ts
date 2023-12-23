import { Request, Response, NextFunction } from 'express';
import CustomError from './errorHandler.js';
import Utils from './utils.js';
import { IAccount } from '../models/userSchema.js';

interface CustomRequest extends Request {
    user?: any;
    sendApiResponse?: any
}

interface CustomResponse extends Response {
    sendApiResponse?: any
}

interface ApiResponse {
    message: string;
    statusCode: number;
    data?: any;
}

const AuthMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userData: IAccount | null = await new Utils().extractUserDetails(req.cookies['ay-token']);
        if (!userData) throw CustomError.AuthenticationError("Invalid or expired session")
        const data = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            email: userData.email,
            emailVerifiedAt: userData.emailVerifiedAt,
            role: userData.role,
            lastLogin: userData.lastLogin,
            avatar: userData.avatar,
            channel: userData.channelUsed
        }
        req.user = data;
        next();
    } catch (error) {
        next(CustomError.AuthenticationError('Expired or Invalid Session, kindly login'));
    }
}


const GlobalResponseMiddleware = (req: Request, res: CustomResponse, next: NextFunction) => {
    res.sendApiResponse = (message: string, statusCode: number, data?: any) => {
        const response: ApiResponse = {
            message,
            statusCode,
            data,
        };
        res.status(statusCode).json(response);
    };
    next();
};



export { AuthMiddleware, GlobalResponseMiddleware };
