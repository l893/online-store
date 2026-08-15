import Cart from './cart.model.js';

export async function deleteUserCartDocument(userId: string): Promise<void> {
  await Cart.deleteOne({
    userId,
  });
}
