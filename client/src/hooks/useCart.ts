import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, type Cart, type CartProductPayload } from "../api/cart.api";
import { trackGa4Event } from "../utils/analytics";

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
    onSuccess: (data: Cart, payload) => {
      queryClient.setQueryData(["cart"], data);
      const item = data.items.find(
        (entry) =>
          entry.productId === payload.productId &&
          entry.karat === (payload.karat || "14kt") &&
          (entry.color || "") === (payload.color || "") &&
          (entry.size || "") === (payload.size || ""),
      );
      if (!item) return;

      const quantity = Number(payload.quantity || 1);
      const itemTotal = Number(
        item.lineTotal ?? Number(item.price || 0) * Number(item.quantity || 0),
      );
      const price = itemTotal / Math.max(Number(item.quantity || 1), 1);
      trackGa4Event("add_to_cart", {
        currency: "INR",
        value: price * quantity,
        items: [
          {
            item_id: item.productId,
            item_name: item.name,
            price,
            quantity,
          },
        ],
      });
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
