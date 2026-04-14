import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarJefeRecinto, actualizarJefeRecinto, eliminarJefeRecinto, convertirJefeADelegado } from "@/lib/api/jefe-recinto";
import type { CreateJefeRecintoDto, UpdateJefeRecintoDto } from "@/lib/types/jefe-recinto";

export function useRegistrarJefeRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJefeRecintoDto) => registrarJefeRecinto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}

export function useActualizarJefeRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJefeRecintoDto }) =>
      actualizarJefeRecinto(id, data),
    onSuccess: () => {
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
export function useConvertirJefeADelegado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { tipo: string; mesaId?: number; enGrupoWhatsapp?: boolean; tieneFotocopiaCarnet?: boolean; agrupacionId?: number } }) =>
      convertirJefeADelegado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recintos-usuario"] });
    },
  });
}