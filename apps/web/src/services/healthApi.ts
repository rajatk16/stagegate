import { ApiError, apiRequest } from "@/lib";

type HealthResponse = {
  status: "ok";
}

export const getHealth = async (signal?: AbortSignal): Promise<HealthResponse> => {
  const data = await apiRequest("/health", { signal, timeoutMs: 8_000 });

  if (typeof data !== 'object' || data === null || !("status" in data) || data.status !== "ok") {
    throw new ApiError(
      "The API returned an unexpected health response.",
      "response"
    );
  }

  return {
    status: data.status
  }
}
