/**
 * API Client Configuration
 * Base client to handle all HTTP requests
 */

// Use the mock URL as default based on the openapi-export.json
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mockapi.com';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // To support potential path parameters, e.g. /rooms/{id} we will just expect endpoint to be fully formed
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Return null or empty object if error to prevent unhandled rejection overlay
      console.warn(`API Fetch Error [${endpoint}]:`, response.statusText);
      return null as any;
    }

    // Attempt to parse JSON response
    const responseText = await response.text();
    if (!responseText) {
      return {} as T; // If empty response
    }

    return JSON.parse(responseText) as T;
  } catch (error) {
    console.warn(`API Fetch Error [${endpoint}]:`, error);
    return null as any;
  }
}
