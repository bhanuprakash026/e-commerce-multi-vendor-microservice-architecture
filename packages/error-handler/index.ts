export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: string;
    public readonly isOperational: boolean;


    constructor(message: string, statusCode: number, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }
};

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
};

export class ValidationError extends AppError {
    constructor(message = "Invalide Request data", details?: any) {
        super(message, 400, true, details)
    }
};

// Authentication Error.
export class AuthError extends AppError {
    constructor(message = "Unauthorizes") {
        super(message, 401)
    }
};

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden Access") {
        super(message, 403)
    }
};


export class DatabaseError extends AppError {
    constructor(message = "Database error", details?: any) {
        super(message, 500, true, details);
    }
};
 
export class RateLimitError extends AppError {
    constructor(message = "Too Many requestss, please try again later", details?: any) {
        super(message, 429);
    }
};