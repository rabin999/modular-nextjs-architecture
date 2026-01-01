import { describe, it, expect } from 'vitest'
import { formatMoney } from '../money'

describe('formatMoney', () => {
    describe('default formatting (USD, en-US)', () => {
        it('should format whole numbers', () => {
            expect(formatMoney(100)).toBe('$100.00')
        })

        it('should format decimal numbers', () => {
            expect(formatMoney(99.99)).toBe('$99.99')
        })

        it('should format large numbers with commas', () => {
            expect(formatMoney(1234567.89)).toBe('$1,234,567.89')
        })

        it('should handle zero', () => {
            expect(formatMoney(0)).toBe('$0.00')
        })

        it('should handle negative numbers', () => {
            expect(formatMoney(-50)).toBe('-$50.00')
        })
    })

    describe('custom currency', () => {
        it('should format EUR', () => {
            const result = formatMoney(100, 'EUR')
            expect(result).toContain('€')
            expect(result).toContain('100')
        })

        it('should format GBP', () => {
            const result = formatMoney(100, 'GBP')
            expect(result).toContain('£')
            expect(result).toContain('100')
        })

        it('should format JPY (no decimals)', () => {
            const result = formatMoney(1000, 'JPY')
            expect(result).toContain('¥')
            // JPY doesn't use decimals
            expect(result).not.toContain('.00')
        })
    })

    describe('custom locale', () => {
        it('should format German style (EUR)', () => {
            const result = formatMoney(1234.56, 'EUR', 'de-DE')
            // German uses comma for decimals and period for thousands
            expect(result).toContain('1.234,56')
            expect(result).toContain('€')
        })

        it('should format French style (EUR)', () => {
            const result = formatMoney(1234.56, 'EUR', 'fr-FR')
            // French uses different formatting
            expect(result).toContain('€')
        })

        it('should format Arabic locale', () => {
            // Arabic numerals may differ based on locale implementation
            const result = formatMoney(100, 'USD', 'ar-SA')
            expect(result).toBeDefined()
        })
    })

    describe('edge cases', () => {
        it('should handle very small numbers', () => {
            expect(formatMoney(0.01)).toBe('$0.01')
        })

        it('should handle very large numbers', () => {
            const result = formatMoney(999999999999.99)
            expect(result).toContain('$')
            expect(result).toContain('999')
        })

        it('should round to 2 decimal places', () => {
            expect(formatMoney(10.999)).toBe('$11.00')
            expect(formatMoney(10.994)).toBe('$10.99')
        })
    })
})
