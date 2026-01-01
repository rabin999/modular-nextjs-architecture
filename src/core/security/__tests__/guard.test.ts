import { describe, it, expect } from 'vitest'
import { sanitizeString, ensureSingle, sanitizeObject } from '../guard'

describe('Security Guard - sanitizeString', () => {
    it('should remove script tags', () => {
        const dirty = '<script>alert("xss")</script>Hello World'
        const clean = sanitizeString(dirty)
        expect(clean).toBe('Hello World')
    })

    it('should remove onclick handlers', () => {
        const dirty = '<div onclick="alert(1)">Click me</div>'
        const clean = sanitizeString(dirty)
        expect(clean).toBe('Click me')
    })

    it('should remove img onerror', () => {
        const dirty = '<img src=x onerror="alert(1)">'
        const clean = sanitizeString(dirty)
        expect(clean).toBe('')
    })

    it('should preserve plain text', () => {
        const text = 'Hello, this is a normal string with numbers 123'
        expect(sanitizeString(text)).toBe(text)
    })

    it('should handle empty string', () => {
        expect(sanitizeString('')).toBe('')
    })

    it('should remove all HTML tags', () => {
        const html = '<p>Paragraph</p><strong>Bold</strong>'
        const clean = sanitizeString(html)
        expect(clean).toBe('ParagraphBold')
    })
})

describe('Security Guard - ensureSingle', () => {
    it('should return undefined for undefined input', () => {
        expect(ensureSingle(undefined)).toBeUndefined()
    })

    it('should return string as-is', () => {
        expect(ensureSingle('hello')).toBe('hello')
    })

    // Default mode is 'strict' - throws on arrays
    it('should throw error for array in default (strict) mode', () => {
        expect(() => ensureSingle(['first', 'second', 'third'])).toThrow('HTTP Parameter Pollution')
    })

    it('should return last value for array in "last" mode', () => {
        expect(ensureSingle(['a', 'b', 'c'], 'last')).toBe('c')
    })

    it('should throw error for multi-item array in "strict" mode', () => {
        expect(() => ensureSingle(['a', 'b'], 'strict')).toThrow('HTTP Parameter Pollution')
    })

    // In strict mode, even a single-item array throws (it's still an array)
    it('should throw for single-item array in "strict" mode', () => {
        expect(() => ensureSingle(['only'], 'strict')).toThrow('HTTP Parameter Pollution')
    })

    it('should return single item for single-item array in "last" mode', () => {
        expect(ensureSingle(['only'], 'last')).toBe('only')
    })

    it('should return undefined for empty array in last mode', () => {
        expect(ensureSingle([], 'last')).toBeUndefined()
    })
})

describe('Security Guard - sanitizeObject', () => {
    it('should sanitize string values in object', () => {
        const dirty = {
            name: '<script>alert(1)</script>John',
            email: 'john@example.com',
        }
        const clean = sanitizeObject(dirty)
        expect(clean.name).toBe('John')
        expect(clean.email).toBe('john@example.com')
    })

    it('should handle nested objects', () => {
        const dirty = {
            user: {
                name: '<b>Bold</b>John',
            },
        }
        const clean = sanitizeObject(dirty)
        expect((clean.user as any).name).toBe('BoldJohn')
    })

    it('should handle arrays', () => {
        const dirty = ['<script>x</script>a', '<b>b</b>']
        const clean = sanitizeObject(dirty)
        expect(clean).toEqual(['a', 'b'])
    })

    it('should preserve numbers', () => {
        expect(sanitizeObject(42)).toBe(42)
    })

    it('should preserve booleans', () => {
        expect(sanitizeObject(true)).toBe(true)
        expect(sanitizeObject(false)).toBe(false)
    })

    it('should handle null', () => {
        expect(sanitizeObject(null)).toBeNull()
    })
})
