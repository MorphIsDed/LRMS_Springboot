import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toastOnError } from "../api/apiClient";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 0
      }
    },
    queryCache: new QueryCache({
      onError: (err) => {
        toastOnError(err);
        // eslint-disable-next-line no-console
        console.error("[rq:error]", err);
      }
    })
  });
}

