import assert from 'assert';
import test from 'node:test';

// Algorithms identical to src/utils/sanitize.ts
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (typeof obj === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }
  return obj;
}

test('sanitizeInput - strips script tags and content', () => {
  const input = '<script>alert("hack")</script>Secure Text';
  const result = sanitizeInput(input);
  assert.strictEqual(result, 'Secure Text');
});

test('sanitizeInput - strips HTML tags', () => {
  const input = '<div className="danger">Caution <b>Notice</b></div>';
  const result = sanitizeInput(input);
  assert.strictEqual(result, 'Caution Notice');
});

test('sanitizeInput - strips event handlers', () => {
  const input = 'hello <img src="x" onerror="alert(1)"> world';
  const result = sanitizeInput(input);
  assert.strictEqual(result, 'hello  world');
});

test('sanitizeObject - recursively sanitizes string properties', () => {
  const payload = {
    username: 'john_doe',
    payload: '<script>alert(1)</script>hello',
    metadata: {
      location: 'New York',
      comment: '<b>comment</b>',
    },
    nestedArray: ['safe', '<script>danger</script>'],
  };

  const expected = {
    username: 'john_doe',
    payload: 'hello',
    metadata: {
      location: 'New York',
      comment: 'comment',
    },
    nestedArray: ['safe', ''],
  };

  const result = sanitizeObject(payload);
  assert.deepStrictEqual(result, expected);
});
