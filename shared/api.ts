/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Login request/response types
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Database status response type
 */
export interface DBStatusResponse {
  status: "connected" | "disconnected" | "connecting";
  message: string;
}

/**
 * GST search response from server proxy
 */
export interface GstApiData {
  gstin: string;
  lgnm?: string; // legal name
  tradeNam?: string;
  sts?: string; // status
  rgdt?: string; // registration date
  pradr?: { addr?: string };
  ctj?: string;
  stj?: string;
  constitution?: string;
}

export interface GstSearchResponse {
  success: boolean;
  source?: string; // gst_api | cache
  data?: GstApiData;
  message?: string;
}
