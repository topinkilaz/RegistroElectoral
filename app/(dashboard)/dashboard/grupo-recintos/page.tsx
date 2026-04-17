"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  MapPin,
  Check,
  X,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
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
import type {
  GrupoRecinto,
  CreateGrupoRecintoDto,
  UpdateGrupoRecintoDto,
} from "@/lib/types/grupo-recinto";
import { useProcess } from "@/lib/context/process-context";
import { ConfirmDialog } from "@/components/asignaciones/modals/confirm-dialog";
import ReactSelect from "react-select";

export default function GruposRecintoPage() {
  const { procesoId } = useProcess();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [manageRecintosOpen, setManageRecintosOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoRecinto | null>(null);

  const [newGrupo, setNewGrupo] = useState<CreateGrupoRecintoDto>({
    nombre: "",
    descripcion: "",
    procesoId: procesoId || 0,
  });
  const [editGrupo, setEditGrupo] = useState<UpdateGrupoRecintoDto>({});

  const [recintoSearch, setRecintoSearch] = useState("");
  const [assignedRecintos, setAssignedRecintos] = useState<any[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteRecintosConfirm, setShowDeleteRecintosConfirm] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<GrupoRecinto | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "search">("assigned");

  const { data: grupos, isLoading, isError } = useGruposRecinto(procesoId || undefined, !!procesoId);
  const { data: grupoDetalle, isLoading: isLoadingGrupoDetalle } = useGrupoRecintoById(
    manageRecintosOpen && selectedGrupo ? selectedGrupo.id : null,
    manageRecintosOpen && !!selectedGrupo
  );

  const shouldSearchRecintos = recintoSearch.length >= 3;
  const { data: recintosData, isLoading: isLoadingRecintos } = useRecintos(
    recintoSearch,
    manageRecintosOpen && shouldSearchRecintos && activeTab === "search"
  );

  const createMutation = useCrearGrupoRecinto();
  const updateMutation = useActualizarGrupoRecinto();
  const sincronizarRecintosMutation = useSincronizarRecintosAGrupo();
  const quitarRecintosMutation = useQuitarRecintosDeGrupo();
  const eliminarMutation = useEliminarGrupoRecinto();

  const selectClassNames = {
    control: (state: any) =>
      `!min-h-9 !bg-background !border-input !rounded-md !shadow-sm ${
        state.isFocused ? "!border-ring !ring-1 !ring-ring" : ""
      }`,
    menu: () => "!bg-popover !border !border-border !rounded-md !shadow-md !z-50",
    menuList: () => "!p-1",
    option: (state: any) =>
      `!rounded-sm !px-2 !py-1.5 !text-sm !cursor-pointer ${
        state.isSelected
          ? "!bg-primary !text-primary-foreground"
          : state.isFocused
            ? "!bg-accent !text-accent-foreground"
            : "!bg-transparent !text-popover-foreground"
      }`,
    singleValue: () => "!text-foreground",
    input: () => "!text-foreground",
    placeholder: () => "!text-muted-foreground",
    dropdownIndicator: () => "!text-muted-foreground hover:!text-foreground",
    clearIndicator: () => "!text-muted-foreground hover:!text-foreground",
    indicatorSeparator: () => "!bg-border",
    noOptionsMessage: () => "!text-muted-foreground",
  };

  const handleSearch = () => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredGrupos = grupos?.filter(grupo =>
    grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const paginatedGrupos = filteredGrupos.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filteredGrupos.length / 10);

  const handleCreate = async () => {
    if (!newGrupo.nombre.trim()) {
      toast.error("Ingrese el nombre del grupo");
      return;
    }
    if (!newGrupo.procesoId || newGrupo.procesoId === 0) {
      toast.error("No hay un proceso seleccionado");
      return;
    }
    try {
      await createMutation.mutateAsync(newGrupo);
      toast.success("Grupo creado exitosamente");
      setCreateModalOpen(false);
      setNewGrupo({
        nombre: "",
        descripcion: "",
        procesoId: procesoId || 0,
      });
    } catch {
      toast.error("Error al crear grupo");
    }
  };

  const handleEdit = async () => {
    if (!selectedGrupo) return;
    try {
      await updateMutation.mutateAsync({ id: selectedGrupo.id, data: editGrupo });
      toast.success("Grupo actualizado exitosamente");
      setEditModalOpen(false);
      setSelectedGrupo(null);
    } catch {
      toast.error("Error al actualizar grupo");
    }
  };

  const handleDelete = async (grupo: GrupoRecinto) => {
    try {
      await eliminarMutation.mutateAsync(grupo.id);
      toast.success("Grupo eliminado exitosamente");
      setShowDeleteConfirm(false);
      setGrupoToDelete(null);
    } catch {
      toast.error("Error al eliminar grupo");
    }
  };

  const openEditModal = (grupo: GrupoRecinto) => {
    setSelectedGrupo(grupo);
    setEditGrupo({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || "",
    });
    setEditModalOpen(true);
  };

  const openManageRecintos = (grupo: GrupoRecinto) => {
    setSelectedGrupo(grupo);
    setManageRecintosOpen(true);
  };

  useEffect(() => {
    if (manageRecintosOpen && grupoDetalle) {
      setAssignedRecintos(grupoDetalle.recintos || []);
      setSelectedToRemove([]);
      setSelectedToAdd([]);
      setActiveTab("assigned");
      setRecintoSearch("");
    }
  }, [manageRecintosOpen, grupoDetalle]);

  const handleQuitarRecintos = async () => {
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

  const handleAgregarRecintos = async () => {
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

  const availableRecintos = recintosData?.data?.filter(
    (r: any) => !assignedRecintos.some((a) => a.id === r.id)
  ) || [];

  if (!procesoId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Selecciona un proceso para gestionar grupos de recinto</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grupos de Recinto</h2>
          <p className="text-muted-foreground">
            Gestiona los grupos de recintos para organizar los recintos por categorías.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Grupo
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Todos los Grupos</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupos..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} size="sm">Buscar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar grupos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre del Grupo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Recintos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGrupos.length > 0 ? (
                    paginatedGrupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-mono text-xs">
                          {grupo.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{grupo.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {grupo.descripcion || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {grupo._count?.recintos || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={grupo.estado === "ACTIVO" ? "default" : "secondary"}
                            className={
                              grupo.estado === "ACTIVO"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {grupo.estado === "ACTIVO" ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openManageRecintos(grupo)}
                                className="flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4" />
                                Gestionar Recintos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openEditModal(grupo)}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setGrupoToDelete(grupo);
                                  setShowDeleteConfirm(true);
                                }}
                                className="flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No se encontraron grupos" : "No hay grupos registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({filteredGrupos.length} grupos)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Grupo de Recinto</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un nuevo grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Grupo *</Label>
              <Input
                value={newGrupo.nombre}
                onChange={(e) => setNewGrupo({ ...newGrupo, nombre: e.target.value })}
                placeholder="Ej: Zona Norte"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={newGrupo.descripcion || ""}
                onChange={(e) => setNewGrupo({ ...newGrupo, descripcion: e.target.value })}
                placeholder="Ej: Grupos de recintos de la zona norte"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grupo de Recinto</DialogTitle>
            <DialogDescription>
              Modifica los datos del grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Grupo *</Label>
              <Input
                value={editGrupo.nombre || ""}
                onChange={(e) => setEditGrupo({ ...editGrupo, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={editGrupo.descripcion || ""}
                onChange={(e) => setEditGrupo({ ...editGrupo, descripcion: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageRecintosOpen} onOpenChange={setManageRecintosOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestionar Recintos - {selectedGrupo?.nombre}</DialogTitle>
            <DialogDescription>
              Agrega o elimina recintos de este grupo
            </DialogDescription>
          </DialogHeader>

          {isLoadingGrupoDetalle ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
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

                  {shouldSearchRecintos && !isLoadingRecintos && availableRecintos.length === 0 && recintoSearch.length >= 3 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron recintos disponibles</p>
                      <p className="text-sm">Todos los recintos encontrados ya están asignados</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setManageRecintosOpen(false)}>
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
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({selectedToRemove.length})
              </Button>
            )}

            {activeTab === "search" && selectedToAdd.length > 0 && (
              <Button
                onClick={handleAgregarRecintos}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => grupoToDelete && handleDelete(grupoToDelete)}
        title="Eliminar Grupo de Recinto"
        description={`¿Estás seguro de eliminar el grupo "${grupoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        isLoading={eliminarMutation.isPending}
      />

      <ConfirmDialog
        open={showDeleteRecintosConfirm}
        onOpenChange={setShowDeleteRecintosConfirm}
        onConfirm={handleQuitarRecintos}
        title="Eliminar Recintos del Grupo"
        description={`¿Estás seguro de eliminar ${selectedToRemove.length} recinto(s) de este grupo? Esta acción no se puede deshacer.`}
        isLoading={quitarRecintosMutation.isPending}
      />
    </div>
  );
}