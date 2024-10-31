import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  // Method for success responses
  success(message: string, data?: Record<string, any>) {
    return {
      status: 'success',
      message,
      ...(data && { ...data }), // Spread data if it exists
    };
  }

  // Method for failure responses
  failure(message: string, statusCode?: string) {
    return {
      status: 'failure',
      message,
      ...(statusCode && { statusCode }), // Spread errorCode if it exists
    };
  }
}
