/**
 * Shared utilities for pc-uni-h5 projects
 * This package can be used by both myEditor and myViewer
 */
/**
 * Check if a value is a plain object
 */
export declare function isPlainObject(value: unknown): value is Record<string, unknown>;
/**
 * Check if a value is a valid JSON string
 */
export declare function isValidJson(value: unknown): boolean;
/**
 * Format date to local string
 */
export declare function formatDate(date: Date | number | string, format?: 'short' | 'long'): string;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLength: number): string;
/**
 * Convert camelCase to kebab-case
 */
export declare function camelToKebab(str: string): string;
/**
 * Safely parse JSON with fallback value
 */
export declare function safeJsonParse<T>(json: string, fallback: T): T;
/**
 * Pretty print JSON string
 */
export declare function prettyPrintJson(obj: unknown, indent?: number): string;
/**
 * Deep clone an object using JSON serialization
 * Note: This method doesn't support functions, undefined, or circular references
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Remove duplicates from an array
 */
export declare function unique<T>(arr: T[]): T[];
/**
 * Group array items by a key function
 */
export declare function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>;
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
export declare function createMessage(type: MessageData['type'], data: unknown): MessageData;
/**
 * Validate message data structure
 */
export declare function isValidMessage(data: unknown): data is MessageData;
//# sourceMappingURL=index.d.ts.map