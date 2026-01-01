import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'

export async function deleteProduct(id: number) {
    // Client-side calls BFF
    return apiClient(`${ENDPOINTS.BFF_BASE}/products/${id}`, {
        method: 'DELETE',
    })
}
