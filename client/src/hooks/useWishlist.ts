import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  wishlistApi,
  type WishlistItem,
  type WishlistProductPayload,
} from "../api/wishlist.api";

export function useWishlist(enabled = true) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
    enabled,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WishlistProductPayload) =>
      wishlistApi.addToWishlist(payload),
    onSuccess: (data: WishlistItem[]) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: (data: WishlistItem[]) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
}
