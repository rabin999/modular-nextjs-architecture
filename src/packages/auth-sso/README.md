
# Enterprise SSO Authentication Package

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [OAuth Flow Diagram](#oauth-flow-diagram)
- [Current Implementation](#current-implementation)
- [Available Functions](#available-functions)
- [Adding a New Provider](#adding-a-new-provider)
- [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)

---

## Overview

A production-ready, isolated SSO authentication package following the "Delete-a-Folder" principle. All logic is self-contained in `src/packages/auth-sso/`, making it fully portable and testable.

### Key Features
- ✅ **Zero dependencies on external auth frameworks** (DIY OAuth2)
- ✅ **Provider interface** enforces consistency
- ✅ **Stateless JWT sessions** using `jose`
- ✅ **Tag-based cache** with revalidation
- ✅ **Client & Server access** to session data
- ✅ **Full CRUD on sessions**

---

## Architecture

```
src/packages/auth-sso/
├── types.ts              # Interfaces (SSOProvider, SSOConfig, SSOPUser)
├── factory.ts            # Provider registry and instantiation
├── session.ts            # JWT session management
├── cache.ts              # Cache tags and revalidation
├── helpers.ts            # High-level helpers (getCurrentUser, etc.)
├── client.tsx            # Client-side React hook (useSession)
├── providers/
│   ├── google.ts         # Google OAuth2 implementation
│   └── facebook.ts       # (Future: Facebook provider)
└── handlers/
    ├── signin.ts         # OAuth initiation handler
    ├── callback.ts       # OAuth callback handler
    ├── session.ts        # Session GET endpoint
    └── logout.ts         # Logout handler
```

**App Router (Thin Layer):**
```
src/app/api/auth/
├── sso/[provider]/signin/route.ts    → Re-exports signinHandler
├── sso/[provider]/callback/route.ts  → Re-exports callbackHandler
├── session/route.ts                  → Re-exports sessionHandler
└── logout/route.ts                   → Re-exports logoutHandler
```

---

## OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OAuth 2.0 Flow Timeline                          │
└─────────────────────────────────────────────────────────────────────────┘

User                Browser              Your App              Google
 │                     │                    │                    │
 │  1. Click Login     │                    │                    │
 │─────────────────────>                    │                    │
 │                     │                    │                    │
 │                     │  GET /api/auth/sso/google/signin       │
 │                     │───────────────────>│                    │
 │                     │                    │                    │
 │                     │                    │  generateState()   │
 │                     │                    │  setCookie()       │
 │                     │                    │  buildAuthURL()    │
 │                     │                    │                    │
 │                     │  302 Redirect      │                    │
 │                     │<───────────────────│                    │
 │                     │                                         │
 │                     │  GET accounts.google.com/oauth2/auth   │
 │                     │────────────────────────────────────────>│
 │                     │                                         │
 │                     │         Google Login Screen            │
 │                     │<────────────────────────────────────────│
 │                     │                                         │
 │  2. Enter Creds     │                                         │
 │─────────────────────>                                         │
 │                     │                                         │
 │                     │  User accepts permissions              │
 │                     │────────────────────────────────────────>│
 │                     │                                         │
 │                     │  302 /callback?code=XXX&state=YYY      │
 │                     │<────────────────────────────────────────│
 │                     │                    │                    │
 │                     │  GET /api/auth/sso/google/callback     │
 │                     │───────────────────>│                    │
 │                     │                    │                    │
 │                     │                    │  validateState()   │
 │                     │                    │  exchangeCode()    │
 │                     │                    │───────────────────>│
 │                     │                    │  POST /token       │
 │                     │                    │                    │
 │                     │                    │<───────────────────│
 │                     │                    │  { access_token }  │
 │                     │                    │                    │
 │                     │                    │  getUser()         │
 │                     │                    │───────────────────>│
 │                     │                    │  GET /userinfo     │
 │                     │                    │                    │
 │                     │                    │<───────────────────│
 │                     │                    │  { email, ... }    │
 │                     │                    │                    │
 │                     │                    │  createSession()   │
 │                     │                    │  setCookie(JWT)    │
 │                     │                    │                    │
 │                     │  302 /en/dashboard │                    │
 │                     │<───────────────────│                    │
 │                     │                    │                    │
 │  3. Dashboard ✅    │                    │                    │
 │<────────────────────│                    │                    │
```

---

## Current Implementation

### Google OAuth2 Provider

**File:** `src/packages/auth-sso/providers/google.ts`

**Scopes Requested:**
- `openid` - OpenID Connect
- `email` - User email address
- `profile` - Name and profile picture
- `user.phonenumbers.read` - Phone number (optional)
- `user.addresses.read` - Address (optional)

**Data Fetched:**
```typescript
{
  id: string;           // Google User ID
  email: string;
  name: string;
  picture?: string;     // Avatar URL
  phone?: string;       // If available
  address?: string;     // If available
  provider: 'google';
  providerId: string;
}
```

---

## Available Functions

### Server-Side (Server Components / API Routes)

```typescript
import {
  getCurrentUser,
  updateSession,
  clearSession,
  revalidateSession,
  revalidateUser,
} from '@/packages/auth-sso';

// Get current user
const user = await getCurrentUser();

// Update session
await updateSession({ role: 'admin' });

// Clear session
await clearSession();

// Revalidate cache
revalidateSession();
revalidateUser('user-123');
```

### Client-Side (React Components)

```typescript
'use client';
import { useSession } from '@/packages/auth-sso';

function MyComponent() {
  const { session, loading, error, logout } = useSession();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {session?.email}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Cache Utilities

```typescript
import { AUTH_CACHE_TAGS } from '@/packages/auth-sso';

// Use in unstable_cache
const cached = unstable_cache(
  async () => { /* ... */ },
  ['key'],
  { tags: [AUTH_CACHE_TAGS.SESSION] }
);
```

---

## Adding a New Provider

### Step 1: Implement the `SSOProvider` Interface

**File:** `src/packages/auth-sso/providers/facebook.ts`

```typescript
import { SSOProvider, SSOConfig, SSOPUser } from '../types';

export class FacebookProvider implements SSOProvider {
  private config: SSOConfig;
  private readonly AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
  private readonly TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
  private readonly USER_INFO_URL = 'https://graph.facebook.com/me';

  constructor(config: SSOConfig) {
    if (!config.clientId || !config.clientSecret) {
      throw new Error('Facebook SSO credentials are missing.');
    }
    this.config = config;
  }

  /**
   * REQUIRED: Build authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const scopes = this.config.scopes?.join(',') || 'email,public_profile';

    const params = new URLSearchParams({
      client_id: this.config.clientId!,
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: scopes,
      response_type: 'code',
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * REQUIRED: Exchange code for user data
   */
  async getUser(code: string): Promise<SSOPUser> {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: this.config.clientId!,
      client_secret: this.config.clientSecret!,
      redirect_uri: this.config.redirectUri,
      code: code,
    });

    const tokenResponse = await fetch(
      `${this.TOKEN_URL}?${tokenParams.toString()}`
    );
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange token');
    }

    const { access_token } = await tokenResponse.json();

    // 2. Fetch user info
    const userResponse = await fetch(
      `${this.USER_INFO_URL}?fields=id,name,email,picture&access_token=${access_token}`
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture?.data?.url,
      provider: 'facebook',
      providerId: userData.id,
    };
  }
}
```

### Step 2: Register in Factory

**File:** `src/packages/auth-sso/factory.ts`

```typescript
import { FacebookProvider } from './providers/facebook';

export type SupportedProvider = 'google' | 'facebook'; // Add here

export class SSOFactory {
  static getProvider(provider: SupportedProvider): SSOProvider {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is not defined');
    }

    switch (provider) {
      case 'google':
        return new GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirectUri: `${baseUrl}/api/auth/sso/google/callback`,
        });
      
      case 'facebook': // Add new provider
        return new FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID || '',
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
          redirectUri: `${baseUrl}/api/auth/sso/facebook/callback`,
        });

      default:
        throw new Error(`Provider ${provider} is not supported.`);
    }
  }
}
```

### Step 3: Add Environment Variables

**File:** `.env.local`

```env
# Facebook SSO
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

### Step 4: Done! ✅

The dynamic routes automatically handle the new provider:
- `/api/auth/sso/facebook/signin`
- `/api/auth/sso/facebook/callback`

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your_long_secure_random_string_for_jwt

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Future: Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

---

## Usage Examples

### Login Flow

```typescript
// Simple link
<a href="/api/auth/sso/google/signin">Login with Google</a>

// Or programmatically
window.location.href = '/api/auth/sso/google/signin';
```

### Protected Server Component

```typescript
import { getCurrentUser } from '@/packages/auth-sso';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return <div>Welcome {user.name}</div>;
}
```

### Client Component with Session

```typescript
'use client';
import { useSession } from '@/packages/auth-sso';

export function UserProfile() {
  const { session, loading, logout } = useSession();

  if (loading) return <Spinner />;
  if (!session) return <LoginButton />;

  return (
    <div>
      <img src={session.picture} alt={session.name} />
      <h1>{session.name}</h1>
      <p>{session.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Update Session

```typescript
import { updateSession } from '@/packages/auth-sso';

// After user upgrades to premium
await updateSession({ 
  role: 'premium',
  subscriptionEndDate: '2026-12-31' 
});
```

---

## Interface Contract

All providers **MUST** implement this interface:

```typescript
export interface SSOProvider {
  /**
   * Generates the authorization URL for the provider
   * @param state - CSRF protection token
   */
  getAuthorizationUrl(state: string): string;

  /**
   * Exchanges authorization code for user data
   * @param code - OAuth authorization code
   */
  getUser(code: string): Promise<SSOPUser>;
}
```

**Required methods:**
1. ✅ `getAuthorizationUrl(state)` - Build OAuth URL
2. ✅ `getUser(code)` - Exchange code for user data

**Required validations:**
- ✅ Validate `clientId` and `clientSecret` in constructor
- ✅ Handle errors gracefully
- ✅ Return properly typed `SSOPUser` object

---

## Security Features

- ✅ **CSRF Protection** - State parameter validation
- ✅ **HttpOnly Cookies** - Session token not accessible to JS
- ✅ **Secure Cookies** - HTTPS-only in production
- ✅ **SameSite** - Protection against CSRF
- ✅ **JWT Encryption** - Signed with HS256
- ✅ **Token Expiration** - 7-day session lifetime
- ✅ **One-time State** - OAuth state consumed immediately

---

## Cache Strategy

**HTTP Cache:**
- Authenticated: `Cache-Control: private, max-age=60, stale-while-revalidate=30`
- Unauthenticated: `Cache-Control: no-store`

**Tag-based Revalidation:**
- `auth-session` - Global session cache
- `user-{id}` - Per-user cache

**Auto-revalidation on:**
- Session update
- Logout
- Manual trigger via `revalidateSession()`

---

## Testing Your Provider

1. **Get OAuth credentials** from provider's developer console
2. **Add to `.env.local`**
3. **Test signin:** Visit `/api/auth/sso/{provider}/signin`
4. **Verify callback:** Check developer console for any errors
5. **Inspect session:** Visit `/en/dashboard` to see JSON payload

---

## Troubleshooting

### "Module not found" errors
- Restart your dev server after adding new providers

### "Invalid state" error
- Clear cookies and try again
- Ensure `NEXT_PUBLIC_APP_URL` is correct

### Missing user data
- Check provider scopes
- Verify API permissions in provider console
- Some fields may require user verification (phone, address)

---

**Package Version:** 1.0.0  
**Last Updated:** 2026-01-02  
**Maintainer:** Enterprise Architecture Team
