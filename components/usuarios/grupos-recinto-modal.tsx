"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  FolderPlus,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useProcess } from "@/lib/context/process-context";
import {
  useGruposRecinto,
  useCrearGrupoRecinto,
  useActualizarGrupoRecinto,
  useAsignarRecintosAGrupo,
  useEliminarGrupoRecinto,
} from "@/lib/hooks/useGruposRecinto";
import { useRecintos } from "@/lib/hooks/useAlcances";
import type { GrupoRecinto } from "@/lib/types/grupo-recinto";
import { ConfirmDialog } from "@/components/asignaciones/modals/confirm-dialog";

interface GruposRecintoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGrupo?: (grupo: GrupoRecinto) => void;
  selectionMode?: boolean;
}

type ViewMode = "list" | "create" | "edit" | "manage-recintos";

export function GruposRecintoModal({
  open,
  onOpenChange,
  onSelectGrupo,
  selectionMode = false,
}: GruposRecintoModalProps) {
  const { procesoId } = useProcess();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoRecinto | null>(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [recintoSearch, setRecintoSearch] = useState("");
  const [selectedRecintoIds, setSelectedRecintoIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<GrupoRecinto | null>(null);

  const { data: grupos, isLoading: isLoadingGrupos } = useGruposRecinto(
    procesoId || undefined,
    open
  );

  const shouldSearchRecintos = recintoSearch.length >= 3;
  const { data: recintosData, isLoading: isLoadingRecintos } = useRecintos(
    recintoSearch,
    open && viewMode === "manage-recintos" && shouldSearchRecintos
  );

  const crearMutation = useCrearGrupoRecinto();
  const actualizarMutation = useActualizarGrupoRecinto();
  const asignarRecintosMutation = useAsignarRecintosAGrupo();
  const eliminarMutation = useEliminarGrupoRecinto();

  useEffect(() => {
    if (!open) {
      setViewMode("list");
      setSelectedGrupo(null);
      setFormData({ nombre: "", descripcion: "" });
      setRecintoSearch("");
      setSelectedRecintoIds([]);
    }
  }, [open]);

  useEffect(() => {
    if (viewMode === "edit" && selectedGrupo) {
      setFormData({
        nombre: selectedGrupo.nombre,
        descripcion: selectedGrupo.descripcion || "",
      });
    } else if (viewMode === "create") {
      setFormData({ nombre: "", descripcion: "" });
    }
  }, [viewMode, selectedGrupo]);

  useEffect(() => {
    if (viewMode === "manage-recintos" && selectedGrupo) {
      setSelectedRecintoIds(selectedGrupo.recintos?.map((r) => r.id) || []);
    }
  }, [viewMode, selectedGrupo]);

  const handleCrear = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!procesoId) {
      toast.error("No hay proceso seleccionado");
      return;
    }

    try {
      await crearMutation.mutateAsync({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        procesoId,
      });
      toast.success("Grupo creado exitosamente");
      setViewMode("list");
      setFormData({ nombre: "", descripcion: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al crear grupo");
    }
  };

  const handleActualizar = async () => {
    if (!formData.nombre.trim() || !selectedGrupo) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await actualizarMutation.mutateAsync({
        id: selectedGrupo.id,
        data: {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined,
        },
      });
      toast.success("Grupo actualizado exitosamente");
      setViewMode("list");
      setSelectedGrupo(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al actualizar grupo");
    }
  };

  const handleAsignarRecintos = async () => {
    if (!selectedGrupo) return;

    try {
      await asignarRecintosMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        data: { recintoIds: selectedRecintoIds },
      });
      toast.success("Recintos asignados exitosamente");
      setViewMode("list");
      setSelectedGrupo(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al asignar recintos");
    }
  };

  const handleEliminar = async () => {
    if (!grupoToDelete) return;

    try {
      await eliminarMutation.mutateAsync(grupoToDelete.id);
      toast.success("Grupo eliminado exitosamente");
      setShowDeleteConfirm(false);
      setGrupoToDelete(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar grupo");
    }
  };

  const toggleRecintoSelection = (recintoId: number) => {
    setSelectedRecintoIds((prev) =>
      prev.includes(recintoId)
        ? prev.filter((id) => id !== recintoId)
        : [...prev, recintoId]
    );
  };

  const handleSelectGrupo = (grupo: GrupoRecinto) => {
    if (selectionMode && onSelectGrupo) {
      onSelectGrupo(grupo);
      onOpenChange(false);
    }
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {grupos?.length || 0} grupo(s) registrado(s)
        </p>
        <Button onClick={() => setViewMode("create")} size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      {isLoadingGrupos ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : grupos && grupos.length > 0 ? (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className={`border rounded-lg p-4 space-y-2 ${
                selectionMode
                  ? "cursor-pointer hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors"
                  : ""
              }`}
              onClick={() => selectionMode && handleSelectGrupo(grupo)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{grupo.nombre}</h4>
                    <Badge variant="secondary" className="shrink-0">
                      {grupo.recintos?.length || 0} recintos
                    </Badge>
                  </div>
                  {grupo.descripcion && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {grupo.descripcion}
                    </p>
                  )}
                </div>

                {!selectionMode && (
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGrupo(grupo);
                        setViewMode("manage-recintos");
                      }}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGrupo(grupo);
                        setViewMode("edit");
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGrupoToDelete(grupo);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {selectionMode && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>

              {grupo.recintos && grupo.recintos.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {grupo.recintos.slice(0, 5).map((recinto) => (
                    <Badge key={recinto.id} variant="outline" className="text-xs">
                      {recinto.nombre}
                    </Badge>
                  ))}
                  {grupo.recintos.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{grupo.recintos.length - 5} más
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
          <FolderPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay grupos de recinto creados</p>
          <p className="text-sm">Crea uno para agrupar recintos</p>
        </div>
      )}
    </div>
  );

  const renderCreateEditView = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setViewMode("list");
          setSelectedGrupo(null);
        }}
        className="mb-2"
      >
        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
        Volver
      </Button>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del Grupo *</Label>
          <Input
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Zona Norte, Urbano Centro..."
          />
        </div>

        <div className="space-y-2">
          <Label>Descripcion (opcional)</Label>
          <Textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            placeholder="Descripcion del grupo de recintos..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode("list");
              setSelectedGrupo(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={viewMode === "create" ? handleCrear : handleActualizar}
            disabled={crearMutation.isPending || actualizarMutation.isPending}
          >
            {(crearMutation.isPending || actualizarMutation.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {viewMode === "create" ? "Crear Grupo" : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderManageRecintosView = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setViewMode("list");
          setSelectedGrupo(null);
          setRecintoSearch("");
          setSelectedRecintoIds([]);
        }}
        className="mb-2"
      >
        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
        Volver
      </Button>

      <div className="bg-muted/50 rounded-lg p-3">
        <h4 className="font-medium">{selectedGrupo?.nombre}</h4>
        {selectedGrupo?.descripcion && (
          <p className="text-sm text-muted-foreground">{selectedGrupo.descripcion}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Recintos Seleccionados ({selectedRecintoIds.length})</Label>
        {selectedRecintoIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-sky-50 dark:bg-sky-950/20 max-h-[150px] overflow-y-auto">
            {selectedRecintoIds.map((id) => {
              const recintoEnGrupo = selectedGrupo?.recintos?.find((r) => r.id === id);
              const recintoEnBusqueda = recintosData?.data?.find((r) => r.id === id);
              const nombre = recintoEnGrupo?.nombre || recintoEnBusqueda?.nombre || `Recinto ${id}`;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  {nombre}
                  <button
                    type="button"
                    onClick={() => toggleRecintoSelection(id)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
            No hay recintos seleccionados
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Buscar y Agregar Recintos</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recinto (min. 3 letras)..."
            value={recintoSearch}
            onChange={(e) => setRecintoSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {recintoSearch.length > 0 && recintoSearch.length < 3 && (
          <p className="text-xs text-muted-foreground">
            Escribe {3 - recintoSearch.length} letra(s) más para buscar...
          </p>
        )}

        {isLoadingRecintos && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {shouldSearchRecintos && recintosData?.data && recintosData.data.length > 0 && (
          <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
            {recintosData.data.map((recinto) => {
              const isSelected = selectedRecintoIds.includes(recinto.id);
              return (
                <div
                  key={recinto.id}
                  className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-sky-100 dark:bg-sky-900/30"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleRecintoSelection(recinto.id)}
                >
                  <span className="text-sm">{recinto.nombre}</span>
                  {isSelected ? (
                    <Badge variant="default" className="bg-sky-600">
                      Seleccionado
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {shouldSearchRecintos &&
          !isLoadingRecintos &&
          recintosData?.data?.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">
              No se encontraron recintos
            </p>
          )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setViewMode("list");
            setSelectedGrupo(null);
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAsignarRecintos}
          disabled={asignarRecintosMutation.isPending}
        >
          {asignarRecintosMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Guardar Recintos
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "list" && (selectionMode ? "Seleccionar Grupo de Recinto" : "Grupos de Recinto")}
              {viewMode === "create" && "Nuevo Grupo de Recinto"}
              {viewMode === "edit" && "Editar Grupo"}
              {viewMode === "manage-recintos" && "Gestionar Recintos"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {viewMode === "list" && renderListView()}
            {(viewMode === "create" || viewMode === "edit") && renderCreateEditView()}
            {viewMode === "manage-recintos" && renderManageRecintosView()}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleEliminar}
        title="Eliminar Grupo de Recinto"
        description={`¿Estás seguro de eliminar el grupo "${grupoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        isLoading={eliminarMutation.isPending}
      />
    </>
  );
}
