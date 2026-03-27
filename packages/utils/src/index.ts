/**
 * Shared utilities for pc-uni-h5 projects
 * This package can be used by both myEditor and myViewer
 */

// ==================== Type Utilities ====================

/**
 * Check if a value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' 
    && value !== null 
    && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Check if a value is a valid JSON string
 */
export function isValidJson(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// ==================== Date Utilities ====================

/**
 * Format date to local string
 */
export function formatDate(date: Date | number | string, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long'
  });
}

// ==================== String Utilities ====================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// ==================== JSON Utilities ====================

/**
 * Safely parse JSON with fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Pretty print JSON string
 */
export function prettyPrintJson(obj: unknown, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Deep clone an object using JSON serialization
 * Note: This method doesn't support functions, undefined, or circular references
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ==================== Array Utilities ====================

/**
 * Remove duplicates from an array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Group array items by a key function
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// ==================== Message Types (for myEditor <-> myViewer communication) ====================

/**
 * Message type for cross-application communication
 */
export interface MessageData {
  type: 'json-data' | 'ping' | 'pong';
  data: unknown;
  timestamp: number;
}

/**
 * Create a message payload
 */
export function createMessage(type: MessageData['type'], data: unknown): MessageData {
  return {
    type,
    data,
    timestamp: Date.now()
  };
}

/**
 * Validate message data structure
 */
export function isValidMessage(data: unknown): data is MessageData {
  if (!isPlainObject(data)) return false;
  return (
    typeof data.timestamp === 'number' &&
    ['json-data', 'ping', 'pong'].includes(data.type as string) &&
    'data' in data
  );
}
