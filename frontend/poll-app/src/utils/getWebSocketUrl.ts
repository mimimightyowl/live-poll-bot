/**
 * Get the WebSocket URL
 * @returns {string} The WebSocket URL
 */

const DEFAULT_WS_URL = 'ws://localhost:3001';

export const getWebSocketUrl = (): string => {
  try {
    // @ts-ignore
    const baseUrl = import.meta.env?.VITE_WS_URL || DEFAULT_WS_URL;
    return baseUrl;
  } catch {
    return DEFAULT_WS_URL;
  }
};
