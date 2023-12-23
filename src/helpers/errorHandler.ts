class CustomError extends Error {
    statusCode: number;

    constructor(name: string, statusCode: number, message: string) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static AuthenticationError(message: string = 'Unauthorized'): CustomError {
        return new CustomError('AuthorizationError', 401, message);
    }

    static BadRequestError(message: string = 'Bad Request'): CustomError {
        return new CustomError('BadRequestError', 400, message);
    }

    static NotFoundError(message: string = 'Resource not found'): CustomError {
        return new CustomError('NotFoundError', 404, message);
    }

    static InternalServerError(message: string = 'Resource not found'): CustomError {
        return new CustomError('NotFoundError', 500, message);
    }

    static ConflictError(message: string = 'Conflict'): CustomError {
        return new CustomError('ConflictError', 409, message);
    }

    static ValidationError(message: string = 'Validation failed'): CustomError {
        return new CustomError('ValidationError', 422, message);
    }

    toObject(): { message: string; statusCode: number } {
        return { message: this.message, statusCode: this.statusCode };
    }
}

export default CustomError;
