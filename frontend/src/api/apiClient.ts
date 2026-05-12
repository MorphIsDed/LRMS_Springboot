import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import { ERROR_MESSAGES } from "../constants/errors";
import type {
  ApiError,
  AppError,
  AuthError,
  FieldErrorBundle,
  NetworkError,
  UnknownError
} from "../types/errors";

const DEFAULT_TIMEOUT_MS = 10_000;
const GET_RETRY_COUNT = 1;

function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function toAppError(err: unknown): AppError {
  if (!isOnline()) {
    const e: NetworkError = { type: "NETWORK_ERROR", message: ERROR_MESSAGES.networkOffline };
    return e;
  }

  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    const status = ax.response?.status;
    const data = ax.response?.data;
    const message =
      (typeof data?.message === "string" && data?.message) ||
      (typeof ax.message === "string" && ax.message) ||
      ERROR_MESSAGES.unknown;

    if (status === 401 || status === 403) {
      const e: AuthError = {
        type: "AUTH_ERROR",
        status,
        message: status === 401 ? ERROR_MESSAGES.unauthorized : ERROR_MESSAGES.forbidden
      };
      return e;
    }

    if ((status === 400 || status === 422) && data) {
      const errs = Array.isArray(data.fieldErrors)
        ? data.fieldErrors
        : Array.isArray(data.errors)
          ? data.errors
          : null;
      if (errs && errs.every((x: any) => typeof x?.field === "string" && typeof x?.message === "string")) {
        const e: FieldErrorBundle = { type: "FIELD_ERROR", fieldErrors: errs };
        return e;
      }
    }

    if (typeof status === "number") {
      const e: ApiError = { type: "API_ERROR", status, message };
      return e;
    }
  }

  const e: UnknownError = { type: "UNKNOWN_ERROR", message: ERROR_MESSAGES.unknown };
  return e;
}

function logoutAndRedirect(status: 401 | 403) {
  const auth = useAuthStore.getState();
  auth.logout(status === 401 ? ERROR_MESSAGES.unauthorized : ERROR_MESSAGES.forbidden);
  // Avoid router coupling inside axios interceptors.
  if (window.location.pathname !== "/login") window.location.assign("/login");
}

function shouldRetryGet(error: AxiosError, config: AxiosRequestConfig) {
  const method = (config.method ?? "get").toLowerCase();
  if (method !== "get") return false;
  if (!error.response) return true; // network/timeout
  const status = error.response.status;
  return status >= 500;
}

function withRetry(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const config = error.config as (AxiosRequestConfig & { __getRetryCount?: number }) | undefined;
      if (!config) return Promise.reject(error);

      const count = config.__getRetryCount ?? 0;
      if (count >= GET_RETRY_COUNT) return Promise.reject(error);
      if (!shouldRetryGet(error, config)) return Promise.reject(error);

      config.__getRetryCount = count + 1;
      return instance.request(config);
    }
  );
}

export function createApiClient(): AxiosInstance {
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

  const client = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS
  });

  client.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };

    const method = (config.method ?? "get").toUpperCase();
    const url = config.url ?? "";
    // eslint-disable-next-line no-console
    console.debug(`[api:req] ${method} ${url}`);
    return config;
  });

  client.interceptors.response.use(
    (res: AxiosResponse) => {
      // eslint-disable-next-line no-console
      console.debug(`[api:res] ${res.status} ${res.config?.url ?? ""}`);
      return res;
    },
    (err) => {
      const appErr = toAppError(err);
      if (appErr.type === "AUTH_ERROR") logoutAndRedirect(appErr.status);
      // eslint-disable-next-line no-console
      console.error("[api:err]", appErr);
      return Promise.reject(appErr);
    }
  );

  withRetry(client);
  return client;
}

export const apiClient = createApiClient();

export function toastOnError(err: unknown) {
  const e = toAppError(err);
  const toast = useToastStore.getState();
  toast.push({ type: "error", message: e.message });
}
