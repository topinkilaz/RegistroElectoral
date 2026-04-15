import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  getAgrupaciones,
  createAgrupacion,
  updateAgrupacion,
  exportarAgrupaciones,
  deleteAgrupacion,
  getAgrupacionesReporte,
  getAgrupacionReporteDetalle,
} from "@/lib/api/agrupaciones";
import type {
  AgrupacionesParams,
  CreateAgrupacionDto,
  UpdateAgrupacionDto,
} from "@/lib/types/agrupacion";
import { useAuth } from "@/lib/context/auth-context";
import { useProcess } from "@/lib/context/process-context";

interface ApiError {
  message: string;
  statusCode?: number;
}

export function useAgrupaciones(
  params?: Omit<AgrupacionesParams, "procesoId">,
) {
  const { isAuthenticated } = useAuth();
  const { procesoId } = useProcess();

  return useQuery({
    queryKey: ["agrupaciones", { ...params, procesoId }],
    queryFn: () => {
      if (!procesoId) {
        throw new Error("No hay proceso seleccionado");
      }
      return getAgrupaciones({ ...params, procesoId });
    },
    enabled: isAuthenticated && !!procesoId,
    retry: false,
  });
}

export function useCreateAgrupacion() {
  const queryClient = useQueryClient();
  const { procesoId } = useProcess();

  return useMutation({
    mutationFn: (data: Omit<CreateAgrupacionDto, "procesoId">) => {
      if (!procesoId) {
        throw new Error("No hay proceso seleccionado");
      }
      return createAgrupacion({ ...data, procesoId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agrupaciones"] });
    },
  });
}

export function useUpdateAgrupacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAgrupacionDto }) =>
      updateAgrupacion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agrupaciones"] });
    },
  });
}

export function useExportarAgrupaciones() {
  const { procesoId } = useProcess();

  return useMutation({
    mutationFn: async () => {
      if (!procesoId) {
        throw new Error("No hay proceso seleccionado");
      }
      return exportarAgrupaciones(procesoId);
    },
  });
}

export function useDeleteAgrupacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgrupacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agrupaciones"] });
    },
  });
}

export function useAgrupacionesReporte() {
  const { isAuthenticated } = useAuth();
  const { procesoId } = useProcess();

  return useQuery({
    queryKey: ["agrupaciones-reporte", procesoId],
    queryFn: () => {
      if (!procesoId) {
        throw new Error("No hay proceso seleccionado");
      }
      return getAgrupacionesReporte(procesoId);
    },
    enabled: isAuthenticated && !!procesoId,
    retry: false,
  });
}

export function useAgrupacionReporteDetalle(id: number | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["agrupacion-reporte-detalle", id],
    queryFn: () => {
      if (!id) {
        throw new Error("No hay agrupación seleccionada");
      }
      return getAgrupacionReporteDetalle(id);
    },
    enabled: isAuthenticated && !!id,
    retry: false,
  });
}
