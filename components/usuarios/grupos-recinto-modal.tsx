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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderPlus,
  ChevronRight,
  MapPin,
  Trash,
  Check,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useProcess } from "@/lib/context/process-context";
import {
  useGruposRecinto,
  useGrupoRecintoById,
  useCrearGrupoRecinto,
  useActualizarGrupoRecinto,
  useSincronizarRecintosAGrupo,
  useEliminarGrupoRecinto,
  useQuitarRecintosDeGrupo,
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
  const [assignedRecintos, setAssignedRecintos] = useState<any[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteRecintosConfirm, setShowDeleteRecintosConfirm] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<GrupoRecinto | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "search">("assigned");

  const { data: grupos, isLoading: isLoadingGrupos } = useGruposRecinto(
    procesoId || undefined,
    open
  );

  const { data: grupoDetalle, isLoading: isLoadingGrupoDetalle } = useGrupoRecintoById(
    viewMode === "manage-recintos" && selectedGrupo ? selectedGrupo.id : null,
    viewMode === "manage-recintos" && !!selectedGrupo
  );

  const shouldSearchRecintos = recintoSearch.length >= 3;
  const { data: recintosData, isLoading: isLoadingRecintos } = useRecintos(
    recintoSearch,
    open && viewMode === "manage-recintos" && shouldSearchRecintos && activeTab === "search"
  );

  const crearMutation = useCrearGrupoRecinto();
  const actualizarMutation = useActualizarGrupoRecinto();
  const sincronizarRecintosMutation = useSincronizarRecintosAGrupo();
  const quitarRecintosMutation = useQuitarRecintosDeGrupo();
  const eliminarMutation = useEliminarGrupoRecinto();

  useEffect(() => {
    if (!open) {
      setViewMode("list");
      setSelectedGrupo(null);
      setFormData({ nombre: "", descripcion: "" });
      setRecintoSearch("");
      setAssignedRecintos([]);
      setSelectedToRemove([]);
      setSelectedToAdd([]);
      setActiveTab("assigned");
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
    if (viewMode === "manage-recintos" && grupoDetalle) {
      setAssignedRecintos(grupoDetalle.recintos || []);
      setSelectedToRemove([]);
      setSelectedToAdd([]);
    }
  }, [viewMode, grupoDetalle]);

  const handleEliminarRecintos = async () => {
    if (!selectedGrupo || selectedToRemove.length === 0) return;

    try {
      await quitarRecintosMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        recintoIds: selectedToRemove,
      });
      
      setAssignedRecintos((prev) => 
        prev.filter((r) => !selectedToRemove.includes(r.id))
      );
      setSelectedToRemove([]);
      toast.success(`${selectedToRemove.length} recinto(s) eliminado(s) del grupo`);
      setShowDeleteRecintosConfirm(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar recintos del grupo");
    }
  };

  const handleGuardarCambios = async () => {
    if (!selectedGrupo || selectedToAdd.length === 0) return;
    
    const nuevosRecintos = recintosData?.data
      ?.filter((r: any) => selectedToAdd.includes(r.id))
      .map((r: any) => ({
        id: r.id,
        nombre: r.nombre,
        codigo: r.codigo,
      })) || [];
    
    const nuevosIds = [...assignedRecintos.map(r => r.id), ...selectedToAdd];
    
    try {
      await sincronizarRecintosMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        data: { recintoIds: nuevosIds },
      });
      
      setAssignedRecintos((prev) => [...prev, ...nuevosRecintos]);
      setSelectedToAdd([]);
      setRecintoSearch("");
      toast.success(`${selectedToAdd.length} recinto(s) agregado(s) al grupo`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al agregar recintos");
    }
  };

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

  const handleEliminarGrupo = async () => {
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

  const toggleRemoveSelection = (recintoId: number) => {
    setSelectedToRemove((prev) =>
      prev.includes(recintoId)
        ? prev.filter((id) => id !== recintoId)
        : [...prev, recintoId]
    );
  };

  const toggleAddSelection = (recintoId: number) => {
    setSelectedToAdd((prev) =>
      prev.includes(recintoId)
        ? prev.filter((id) => id !== recintoId)
        : [...prev, recintoId]
    );
  };

  const selectAllToRemove = () => {
    if (selectedToRemove.length === assignedRecintos.length) {
      setSelectedToRemove([]);
    } else {
      setSelectedToRemove(assignedRecintos.map((r) => r.id));
    }
  };

  const selectAllToAdd = () => {
    const availableRecintos = recintosData?.data?.filter(
      (r: any) => !assignedRecintos.some((a) => a.id === r.id)
    ) || [];
    
    if (selectedToAdd.length === availableRecintos.length) {
      setSelectedToAdd([]);
    } else {
      setSelectedToAdd(availableRecintos.map((r: any) => r.id));
    }
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
                      {grupo._count?.recintos || 0} recintos
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
          <Label>Descripción (opcional)</Label>
          <Textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            placeholder="Descripción del grupo de recintos..."
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

  const renderManageRecintosView = () => {
    const availableRecintos = recintosData?.data?.filter(
      (r: any) => !assignedRecintos.some((a) => a.id === r.id)
    ) || [];

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setViewMode("list");
            setSelectedGrupo(null);
            setRecintoSearch("");
            setAssignedRecintos([]);
            setSelectedToRemove([]);
            setSelectedToAdd([]);
          }}
          className="mb-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          Volver
        </Button>

        {isLoadingGrupoDetalle ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium">{grupoDetalle?.nombre}</h4>
              {grupoDetalle?.descripcion && (
                <p className="text-sm text-muted-foreground">{grupoDetalle.descripcion}</p>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assigned" className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Recintos Asignados ({assignedRecintos.length})
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Agregar Recintos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assigned" className="space-y-3 mt-4">
                {assignedRecintos.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Selecciona recintos para eliminar</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllToRemove}
                        className="h-auto py-1 text-xs"
                      >
                        {selectedToRemove.length === assignedRecintos.length ? "Deseleccionar todo" : "Seleccionar todo"}
                      </Button>
                    </div>
                    <div className="border rounded-lg divide-y max-h-[350px] overflow-y-auto">
                      {assignedRecintos.map((recinto) => {
                        const isSelected = selectedToRemove.includes(recinto.id);
                        return (
                          <div
                            key={recinto.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => toggleRemoveSelection(recinto.id)}
                          >
                            <Checkbox checked={isSelected} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{recinto.nombre}</p>
                              {recinto.codigo && (
                                <p className="text-xs text-muted-foreground">Código: {recinto.codigo}</p>
                              )}
                            </div>
                            {isSelected && (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay recintos asignados</p>
                    <p className="text-sm">Ve a la pestaña "Agregar Recintos" para añadir</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="search" className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar recinto por nombre o código..."
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
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}

                {shouldSearchRecintos && availableRecintos.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>Selecciona recintos para agregar</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllToAdd}
                        className="h-auto py-1 text-xs"
                      >
                        {selectedToAdd.length === availableRecintos.length ? "Deseleccionar todo" : "Seleccionar todo"}
                      </Button>
                    </div>
                    <div className="border rounded-lg divide-y max-h-[350px] overflow-y-auto">
                      {availableRecintos.map((recinto: any) => {
                        const isSelected = selectedToAdd.includes(recinto.id);
                        return (
                          <div
                            key={recinto.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-sky-50 dark:bg-sky-950/20 border-l-4 border-l-sky-500"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => toggleAddSelection(recinto.id)}
                          >
                            <Checkbox checked={isSelected} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{recinto.nombre}</p>
                              {recinto.codigo && (
                                <p className="text-xs text-muted-foreground">Código: {recinto.codigo}</p>
                              )}
                            </div>
                            {!isSelected && (
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {shouldSearchRecintos && !isLoadingRecintos && availableRecintos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron recintos disponibles</p>
                    <p className="text-sm">Todos los recintos encontrados ya están asignados</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setViewMode("list");
                  setSelectedGrupo(null);
                }}
              >
                Cancelar
              </Button>
              
              {activeTab === "assigned" && selectedToRemove.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteRecintosConfirm(true)}
                  disabled={quitarRecintosMutation.isPending}
                >
                  {quitarRecintosMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar ({selectedToRemove.length})
                </Button>
              )}

              {activeTab === "search" && selectedToAdd.length > 0 && (
                <Button
                  onClick={handleGuardarCambios}
                  disabled={sincronizarRecintosMutation.isPending}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  {sincronizarRecintosMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
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
        onConfirm={handleEliminarGrupo}
        title="Eliminar Grupo de Recinto"
        description={`¿Estás seguro de eliminar el grupo "${grupoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        isLoading={eliminarMutation.isPending}
      />

      <ConfirmDialog
        open={showDeleteRecintosConfirm}
        onOpenChange={setShowDeleteRecintosConfirm}
        onConfirm={handleEliminarRecintos}
        title="Eliminar Recintos del Grupo"
        description={`¿Estás seguro de eliminar ${selectedToRemove.length} recinto(s) de este grupo? Esta acción no se puede deshacer.`}
        isLoading={quitarRecintosMutation.isPending}
      />
    </>
  );
}