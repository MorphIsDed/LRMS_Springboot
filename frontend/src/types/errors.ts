export type ApiError = {
  type: "API_ERROR";
  status: number;
  message: string;
  code?: string;
};

export type FieldError = { field: string; message: string };
export type FieldErrorBundle = { type: "FIELD_ERROR"; fieldErrors: FieldError[] };

export type NetworkError = { type: "NETWORK_ERROR"; message: string };
export type AuthError = { type: "AUTH_ERROR"; status: 401 | 403; message: string };
export type ValidationError = { type: "VALIDATION_ERROR"; message: string };
export type UnknownError = { type: "UNKNOWN_ERROR"; message: string };

export type AppError =
  | ApiError
  | FieldErrorBundle
  | NetworkError
  | AuthError
  | ValidationError
  | UnknownError;

export function isApiError(err: unknown): err is ApiError {
  if (!err || typeof err !== "object") return false;
  const v = err as Partial<ApiError>;
  return v.type === "API_ERROR" && typeof v.status === "number" && typeof v.message === "string";
}

export function isFieldError(err: unknown): err is FieldErrorBundle {
  if (!err || typeof err !== "object") return false;
  const v = err as Partial<FieldErrorBundle>;
  return v.type === "FIELD_ERROR" && Array.isArray(v.fieldErrors);
}

