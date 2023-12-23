import { MongoError } from "mongodb";
import { Error as MongooseError } from "mongoose";
class MongooseErrorUtils {
  static handleDuplicateKeyError(error: any): string {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const errorMessage = `Duplicate value detected: The value '${value}' already exists for field '${field}'.`;
    return errorMessage;
  }

  static handleValidationError(error: MongooseError.ValidationError): string {
    const errors = Object.values(error.errors).map((e: any) => e.message);
    const errorMessage = `Validation Error: ${errors.join(", ")}`;
    return errorMessage;
  }

  static handleMongooseError(error: MongooseError | MongoError): string {
    let errorMessage: string;

    switch ((error as any).code) {
      case 11000:
        errorMessage = MongooseErrorUtils.handleDuplicateKeyError(
          error as MongoError
        );
        break;
      default:
        if (error.name === "ValidationError") {
          errorMessage = MongooseErrorUtils.handleValidationError(
            error as MongooseError.ValidationError
          );
        } else {
          errorMessage =
            "An unknown error occurred while processing the request.";
        }
    }

    return errorMessage;
  }
}

export default MongooseErrorUtils;
