import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, type Cart, type CartProductPayload } from "../api/cart.api";

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CartProductPayload) => cartApi.addToCart(payload),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}
