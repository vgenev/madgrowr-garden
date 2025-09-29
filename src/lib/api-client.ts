import { ApiResponse } from "@shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const json = (await res.json()) as ApiResponse<T>
  if (json.success) {
    if (json.data === undefined) {
      throw new Error('Request failed: No data returned');
    }
    return json.data;
  } else if (json.success === false) {
    throw new Error(json.error || 'Request failed');
  } else {
    // This case should not be reachable if the API response is well-formed.
    throw new Error('Request failed: Invalid API response structure');
  }
}