# Enterprise API Response Standard

This standard defines a unified, predictable structure for all API responses. It is designed to be consumed easily by any client (Web, Mobile, External Partners) and scale from simple CRUD to complex microservices.

## 1. Success Response Structure

Every successful response MUST return HTTP 2xx and follow this schema:

```json
{
  "ok": true,
  "data": { ... },       // The actual payload (Object, Array, or null)
  "meta": {              // Optional metadata (Pagination, Trace IDs)
    "page": 1,
    "limit": 20,
    "total": 105,
    "requestId": "req_123abc" 
  }
}
```

### Why this works:
*   **ok: true**: Removes ambiguity. Clients check this boolean first.
*   **data Wrapper**: Prevents "root array" issues (JSON vulnerability) and allows adding top-level fields later without breaking clients.
*   **meta**: Standard home for non-business logic (pagination, performance stats).

---

## 2. Error Response Structure

Every failed response MUST return HTTP 4xx/5xx and follow this schema:

```json
{
  "ok": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",  // Machine-readable, immutable enum
    "message": "User 123 not found", // Human-readable, English default (Developer Focused)
    "details": [                     // Optional: Structured validation errors
      {
        "field": "email",
        "issue": "invalid_format",
        "description": "Email must be valid"
      }
    ],
    "traceId": "trace_987xyz"        // For debugging support tickets
  }
}
```

### Why we need both `code` AND `message`:
*   **`code` is for the App**: The Frontend uses this to look up the correct translation (e.g., `t('errors.RESOURCE_NOT_FOUND')`). It is stable and never changes.
*   **`message` is for the Developer**: When debugging in Chrome DevTools or reading logs (Sentry/Datadog), seeing `"Payment failed"` is much faster than looking up what `"ERR_7021"` means.
*   **Fallback**: If the Frontend encounters a new code it doesn't recognize yet (e.g., after a Backend update), it can display this `message` as a fallback so the user isn't left in the dark.

---

## 3. Best Practices Checklist

1.  **Always use HTTP Status Codes**:
    *   `200`: Success
    *   `201`: Created
    *   `400`: Bad Request (Validation)
    *   `401`: Unauthorized (Not logged in)
    *   `403`: Forbidden (Logged in, no permission)
    *   `404`: Not Found
    *   `500`: Internal Server Error

2.  **Pagination Standard**:
    *   **Cursor-based** (Infinite Feeds): `{ "nextCursor": "...", "hasMore": true } `
    *   **Offset-based** (Admin Tables): `{ "page": 1, "total": 500 }`

3.  **Data Typing & Naming Conventions**:
    *   **camelCase**: All JSON keys MUST be in `camelCase` (e.g., `firstName`, not `first_name`).
    *   **Booleans**: Use native JSON booleans (`true`/`false`) and prefix with `is`, `has`, or `should` (e.g., `isActive`: true, not `active`: 1).
    *   **Nulls**: Use explicit `null` for known missing values. Do not use "undefined" string or omit the key if the data contract expects it.

4.  **Date Formats**:
    *   ALWAYS use ISO 8601 Strings (`2024-01-01T12:00:00Z`). Never separate date parts or use milliseconds.

5.  **Envelope Enforcement**:
    *   Even for empty responses (e.g., `DELETE`), return `{ "ok": true, "data": null }`. Never return raw strings or empty bodies.

---

## 4. Internationalization (i18n) Strategy

### **Recommendation: Frontend-Driven Translation**
Do **NOT** translate messages on the Backend. The Backend should send immutable, standard computer-readable codes, and the Frontend (Client) should map them to user-friendly messages.

### Why?
1.  **Separation of Concerns**: The Backend shouldn't know about the UI's locale or user preferences. Its job is data integrity.
2.  **Payload Size**: Sending English strings + codes is lighter.
3.  **Flexibility**: If a PM wants to change "Invalid Password" to "Password must contain a symbol", you only redeploy the frontend, not the backend API.
4.  **Consistency**: Web, iOS, and Android clients might want different phrasing for the same error.

### How to implement:
*   **Backend sends**: `"code": "AUTH_INVALID_CREDENTIALS"`
*   **Frontend (en.json)**: `"AUTH_INVALID_CREDENTIALS": "The email or password you entered is incorrect."`
*   **Frontend (es.json)**: `"AUTH_INVALID_CREDENTIALS": "El correo o la contraseña son incorrectos."`

**Exception**:
For highly dynamic, database-driven content (like product names or blog posts), the backend *must* return the translated text (e.g., `name_en`, `name_ar` or based on `Accept-Language` header). But for **system messages and errors**, always use codes.
