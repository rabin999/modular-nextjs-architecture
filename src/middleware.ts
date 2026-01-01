import { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './core/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request)

    // 🛡️ Security Headers
    const headers = response.headers

    // 1. HTTP Strict Transport Security (HSTS)
    // Enforces HTTPS for 1 year, includes subdomains, preload
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

    // 2. Anti-Clickjacking (X-Frame-Options)
    // Prevents the site from being embedded in an iframe (legacy support for CSP frame-ancestors)
    headers.set('X-Frame-Options', 'DENY')

    // 3. MIME Sniffing Protection
    // Prevents the browser from guessing the Content-Type
    headers.set('X-Content-Type-Options', 'nosniff')

    // 4. Referrer Policy
    // Controls how much referrer information is sent to third parties
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 5. Content Security Policy (CSP)
    // Strict policy to prevent XSS, data injection, etc.
    // Note: 'unsafe-inline' and 'unsafe-eval' often needed for Next.js dev mode/libs,
    // but in prod you'd want to remove them or use nonces (advanced).
    // For this demo, we set a baseline strict policy.

    // Dynamic image sources - can be configured via env vars or feature registry
    const allowedImageDomains = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
        ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(',').map(d => d.trim())
        : ['https://fakestoreapi.com', 'https://i.pravatar.cc']

    const imgSrc = ["'self'", 'blob:', 'data:', ...allowedImageDomains].join(' ')

    const csp = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src ${imgSrc};
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `
        .replace(/\s{2,}/g, ' ')
        .trim()

    headers.set('Content-Security-Policy', csp)

    // 6. Permissions Policy
    // Disable web features we don't use to reduce attack surface
    const permissions = `
        camera=(), 
        microphone=(), 
        geolocation=(), 
        browsing-topics=(),
        payment=()
    `
        .replace(/\s{2,}/g, ' ')
        .trim()
    headers.set('Permissions-Policy', permissions)

    return response
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*'],
}
