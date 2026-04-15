import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { registrarDelegadoMesa, actualizarDelegadoMesa, eliminarDelegadoMesa, convertirDelegadoAJefe, getMisDatosDelegado } from "@/lib/api/delegado-mesa";
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

export function useConvertirDelegadoAJefe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { tipo: string; enGrupoWhatsapp?: boolean; tieneFotocopiaCarnet?: boolean; agrupacionId?: number } }) =>
      convertirDelegadoAJefe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}

export function useMisDatosDelegado(enabled: boolean = true) {
  return useQuery({
    queryKey: ["mis-datos-delegado"],
    queryFn: getMisDatosDelegado,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}