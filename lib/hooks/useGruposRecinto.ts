import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGruposRecinto,
  getGrupoRecintoById,
  crearGrupoRecinto,
  actualizarGrupoRecinto,
  sincronizarRecintosAGrupo,
  agregarRecintosAGrupo,
  quitarRecintosDeGrupo,
  eliminarGrupoRecinto,
} from "@/lib/api/grupos-recinto";
import type {
  CreateGrupoRecintoDto,
  UpdateGrupoRecintoDto,
  AsignarRecintosDto,
} from "@/lib/types/grupo-recinto";

export function useGruposRecinto(procesoId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["grupos-recinto", procesoId],
    queryFn: () => getGruposRecinto(procesoId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGrupoRecintoById(id: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["grupo-recinto", id],
    queryFn: () => getGrupoRecintoById(id!),
    enabled: enabled && !!id,
  });
}

export function useCrearGrupoRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGrupoRecintoDto) => crearGrupoRecinto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
    },
  });
}

export function useActualizarGrupoRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGrupoRecintoDto }) =>
      actualizarGrupoRecinto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-recinto"] });
    },
  });
}


export function useSincronizarRecintosAGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grupoId, data }: { grupoId: number; data: AsignarRecintosDto }) =>
      sincronizarRecintosAGrupo(grupoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-recinto"] });
    },
  });
}


export function useAgregarRecintosAGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grupoId, data }: { grupoId: number; data: AsignarRecintosDto }) =>
      agregarRecintosAGrupo(grupoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-recinto"] });
    },
  });
}


export function useQuitarRecintosDeGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grupoId, recintoIds }: { grupoId: number; recintoIds: number[] }) =>
      quitarRecintosDeGrupo(grupoId, recintoIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-recinto"] });
    },
  });
}

export function useEliminarGrupoRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarGrupoRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-recinto"] });
    },
  });
}