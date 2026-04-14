import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarJefeRecinto, eliminarJefeRecinto } from "@/lib/api/jefe-recinto";
import type { CreateJefeRecintoDto } from "@/lib/types/jefe-recinto";

export function useRegistrarJefeRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJefeRecintoDto) => registrarJefeRecinto(data),
    onSuccess: () => {
      // Invalidar todas las queries que empiecen con "recintos-usuario"
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}

export function useEliminarJefeRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarJefeRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}
