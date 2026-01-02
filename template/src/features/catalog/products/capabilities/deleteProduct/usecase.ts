import { deleteProduct as deleteProductApi } from './api'

// Use Case: Delete Product
// Encapsulates the specific business rules or workflow for deleting a product.
// In a more complex app, this might involve tracking analytics, optimistic updates helper generation, etc.
export async function deleteProductUseCase(id: number) {
    // We could add business logic here before calling the API
    return deleteProductApi(id)
}
