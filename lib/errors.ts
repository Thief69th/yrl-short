export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "You must be signed in to access this resource.") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to access this resource.") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 503);
    this.name = "ConfigurationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}
