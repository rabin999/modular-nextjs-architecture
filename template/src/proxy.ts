import { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './core/i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * Applies security headers to the response.
 * Includes HSTS, X-Frame-Options, CSP, and Permissions Policy.
 */
function applySecurityHeaders(headers: Headers) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

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
}

export default function proxy(request: NextRequest) {
    const response = intlMiddleware(request)
    applySecurityHeaders(response.headers)
    return response
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*'],
}
