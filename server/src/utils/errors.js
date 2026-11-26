export class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        if (details) {
            this.details = details;
        }
    }
}

