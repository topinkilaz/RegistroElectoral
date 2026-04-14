import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarDelegadoMesa, actualizarDelegadoMesa, eliminarDelegadoMesa } from "@/lib/api/delegado-mesa";
import type { CreateDelegadoMesaDto, UpdateDelegadoMesaDto } from "@/lib/types/delegado-mesa";

export function useRegistrarDelegadoMesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDelegadoMesaDto) => registrarDelegadoMesa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}

export function useActualizarDelegadoMesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDelegadoMesaDto }) =>
      actualizarDelegadoMesa(id, data),
    onSuccess: () => {
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
