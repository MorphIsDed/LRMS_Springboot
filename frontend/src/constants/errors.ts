export const MAX_RETRIES = 1 as const;

export const ERROR_MESSAGES = {
  networkOffline: "You appear to be offline.",
  server: "Server error. Contact admin.",
  unauthorized: "Please log in again.",
  forbidden: "You are not allowed to access this.",
  unknown: "Something went wrong."
} as const;

