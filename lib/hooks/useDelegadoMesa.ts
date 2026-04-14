import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarDelegadoMesa, eliminarDelegadoMesa } from "@/lib/api/delegado-mesa";
import type { CreateDelegadoMesaDto } from "@/lib/types/delegado-mesa";

export function useRegistrarDelegadoMesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDelegadoMesaDto) => registrarDelegadoMesa(data),
    onSuccess: () => {
      // Invalidar todas las queries que empiecen con "recintos-usuario"
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}

export function useEliminarDelegadoMesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarDelegadoMesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}
