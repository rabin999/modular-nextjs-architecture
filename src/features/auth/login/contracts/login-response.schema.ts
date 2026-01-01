import { z } from 'zod'

export const loginResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string().email().optional(),
        firstname: z.string().optional(),
        lastname: z.string().optional(),
        phone: z.string().optional(),
    }),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
