import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { addToCart, removeFromCart, updateQuantity, clearCart, CartItem } from '@/lib/features/cartSlice';

export const useCart = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const addItem = (item: CartItem) => {
    dispatch(addToCart(item));
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const clear = () => {
    dispatch(clearCart());
  };

  return {
    items: cart.items,
    total: cart.total,
    addItem,
    removeItem,
    updateItemQuantity,
    clear,
  };
};

export default useCart; 