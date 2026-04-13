import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  getRecintos,
  createRecinto,
  updateRecinto,
  cambiarEstadoRecinto,
  deleteRecinto,
} from "@/lib/api/recintosTable";
import type {
  RecintosParams,
  CreateRecintoDto,
  UpdateRecintoDto,
  CambiarEstadoRecintoDto,
} from "@/lib/types/recintosTable";
import { useAuth } from "@/lib/context/auth-context";

interface ApiError {
  message: string;
  statusCode?: number;
}

export function useRecintos(params?: RecintosParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["recintos", params],
    queryFn: () => getRecintos(params),
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useCreateRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecinto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos"] });
    },
  });
}

export function useUpdateRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecintoDto }) =>
      updateRecinto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos"] });
    },
  });
}

export function useCambiarEstadoRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarEstadoRecintoDto }) =>
      cambiarEstadoRecinto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos"] });
    },
  });
}

export function useDeleteRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecinto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos"] });
    },
  });
}
