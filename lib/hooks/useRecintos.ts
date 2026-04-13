import { useQuery } from "@tanstack/react-query";
import { getRecintosPorUsuario } from "@/lib/api/recintos";
import type { RecintosParams } from "@/lib/types/recinto";
import { useAuth } from "@/lib/context/auth-context";
import { useProcess } from "@/lib/context/process-context";

export function useRecintosPorUsuario(
  params?: Omit<RecintosParams, "procesoId">
) {
  const { isAuthenticated, user } = useAuth();
  const { procesoId } = useProcess();

  return useQuery({
    queryKey: ["recintos-usuario", user?.id, procesoId, params],
    queryFn: () =>
      getRecintosPorUsuario(user!.id, {
        procesoId: procesoId!,
        ...params,
      }),
    enabled: isAuthenticated && !!user?.id && !!procesoId,
    retry: false,
  });
}