import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDistritos,
  createDistrito,
  updateDistrito,
  deleteDistrito,
} from "@/lib/api/distritos";
import type {
  CreateDistritoDto,
  UpdateDistritoDto,
} from "@/lib/types/distritos";
import { useAuth } from "@/lib/context/auth-context";

export function useDistritos() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["distritos-municipales"],
    queryFn: getDistritos,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateDistrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDistrito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos-municipales"] });
    },
  });
}

export function useUpdateDistrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDistritoDto }) =>
      updateDistrito(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos-municipales"] });
    },
  });
}

export function useDeleteDistrito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDistrito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos-municipales"] });
    },
  });
}