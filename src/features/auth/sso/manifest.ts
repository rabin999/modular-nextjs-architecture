
export const ssoManifest = {
    id: 'auth-sso',
    name: 'Single Sign-On',
    description: 'Enterprise SSO integration for Google and other providers',
    version: '1.0.0',
    enabled: true,
    type: 'feature',
    authors: ['Rabin Bhandari'],
    // This feature exposes its own API routes dynamically but registers here for visibility
    api: {
        base: '/api/auth/sso',
    },
    messages: undefined,
}
