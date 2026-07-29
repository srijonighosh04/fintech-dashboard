/**
 * Removes dangerous HTML tags and script injection characters from raw inputs.
 * Blocks standard XSS vectors (e.g. <script>, onload/onerror handlers, javascript: URIs).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;

  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags & code block content
    .replace(/<[^>]+>/g, '') // Strip any remaining HTML tags
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (e.g. onclick=, onerror=)
    .replace(/javascript\s*:/gi, '') // Remove javascript: pseudo-protocol references
    .trim();
}

/**
 * Recursively inspects and sanitizes all string properties of an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }

  return obj;
}
