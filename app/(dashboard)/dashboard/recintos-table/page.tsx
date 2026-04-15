"use client";

import { useState } from "react";
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
  Eye,
  EyeOff,
  Building2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useRecintos,
  useCreateRecinto,
  useUpdateRecinto,
  useCambiarEstadoRecinto,
  useDeleteRecinto,
} from "@/lib/hooks/useRecintosTable";
import { useListasGeograficas } from "@/lib/hooks/useAlcances";
import type {
  Recinto,
  CreateRecintoDto,
  UpdateRecintoDto,
} from "@/lib/types/recintosTable";

export default function RecintosPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecinto, setSelectedRecinto] = useState<Recinto | null>(null);

  const [newRecinto, setNewRecinto] = useState<CreateRecintoDto>({
    nombre: "",
    direccion: "",
    coordenadasGps: "",
    codigo: "",
    cantidadMesas: 0,
    distritoMunicipalId: undefined,
    localidadId: 0,
  });
  const [editRecinto, setEditRecinto] = useState<UpdateRecintoDto>({});

  const { localidades, distritosMunicipales } = useListasGeograficas();

  const { data, isLoading, isError } = useRecintos({
    page,
    limit: 10,
    search: searchTerm || undefined,
  });
  const createMutation = useCreateRecinto();
  const updateMutation = useUpdateRecinto();
  const estadoMutation = useCambiarEstadoRecinto();
  const deleteMutation = useDeleteRecinto();

  const handleSearch = () => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreate = async () => {
    if (!newRecinto.nombre.trim()) {
      toast.error("Ingrese el nombre del recinto");
      return;
    }
    if (!newRecinto.codigo.trim()) {
      toast.error("Ingrese el código del recinto");
      return;
    }
    if (!newRecinto.localidadId || newRecinto.localidadId === 0) {
      toast.error("Seleccione una localidad");
      return;
    }
    try {
      await createMutation.mutateAsync(newRecinto);
      toast.success("Recinto creado exitosamente");
      setCreateModalOpen(false);
      setNewRecinto({
        nombre: "",
        direccion: "",
        coordenadasGps: "",
        codigo: "",
        cantidadMesas: 0,
        distritoMunicipalId: undefined,
        localidadId: 0,
      });
    } catch {
      toast.error("Error al crear recinto");
    }
  };

  const handleEdit = async () => {
    if (!selectedRecinto) return;
    try {
      await updateMutation.mutateAsync({ id: selectedRecinto.id, data: editRecinto });
      toast.success("Recinto actualizado exitosamente");
      setEditModalOpen(false);
      setSelectedRecinto(null);
    } catch {
      toast.error("Error al actualizar recinto");
    }
  };

  const handleToggleEstado = async (recinto: Recinto) => {
    const nuevoEstado = !recinto.eliminado;
    try {
      await estadoMutation.mutateAsync({
        id: recinto.id,
        data: { eliminado: nuevoEstado },
      });
      toast.success(`Recinto ${nuevoEstado ? "desactivado" : "activado"} exitosamente`);
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleDelete = async (recinto: Recinto) => {
    if (confirm(`¿Está seguro de eliminar permanentemente el recinto "${recinto.nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(recinto.id);
        toast.success("Recinto eliminado exitosamente");
      } catch {
        toast.error("Error al eliminar recinto");
      }
    }
  };

  const openEditModal = (recinto: Recinto) => {
    setSelectedRecinto(recinto);
    setEditRecinto({
      nombre: recinto.nombre,
      direccion: recinto.direccion || "",
      coordenadasGps: recinto.coordenadasGps || "",
      codigo: recinto.codigo,
      cantidadMesas: recinto.cantidadMesas,
      distritoMunicipalId: recinto.distritoMunicipalId || undefined,
      localidadId: recinto.localidadId,
    });
    setEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recintos</h2>
          <p className="text-muted-foreground">
            Gestiona los recintos y sus localidades.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Recinto
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Todos los Recintos</CardTitle>
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recintos..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch} size="sm">Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar recintos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre del Recinto</TableHead>
                    <TableHead>Localidad</TableHead>
                    <TableHead>Mesas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((recinto) => (
                    <TableRow key={recinto.id}>
                      <TableCell className="font-mono text-xs">
                        {recinto.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {recinto.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{recinto.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {recinto.localidad?.nombre || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {recinto.cantidadMesas}
                      </TableCell>
                     <TableCell>
  <Badge
    variant={!recinto.eliminado ? "default" : "secondary"}
    className={
      !recinto.eliminado
        ? "bg-green-500 hover:bg-green-600"
        : "bg-red-500 hover:bg-red-600"
    }
  >
    {!recinto.eliminado ? "ACTIVO" : "INACTIVO"}
  </Badge>
</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(recinto.updatedAt)}
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
                              onClick={() => openEditModal(recinto)}
                              className="flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleEstado(recinto)}
                              className="flex items-center gap-2"
                            >
                              {!recinto.eliminado ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(recinto)}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar Permanentemente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.totalItems} recintos)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!data.pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.pagination.hasNextPage}
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

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Recinto</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un nuevo recinto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Recinto *</Label>
                <Input
                  value={newRecinto.nombre}
                  onChange={(e) => setNewRecinto({ ...newRecinto, nombre: e.target.value })}
                  placeholder="Ej: U.E. René Arteaga"
                />
              </div>
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={newRecinto.codigo}
                  onChange={(e) => setNewRecinto({ ...newRecinto, codigo: e.target.value })}
                  placeholder="Ej: REC-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={newRecinto.direccion || ""}
                onChange={(e) => setNewRecinto({ ...newRecinto, direccion: e.target.value })}
                placeholder="Ej: Av. Principal #123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coordenadas GPS</Label>
                <Input
                  value={newRecinto.coordenadasGps || ""}
                  onChange={(e) => setNewRecinto({ ...newRecinto, coordenadasGps: e.target.value })}
                  placeholder="Ej: -12.0463889, -77.0482639"
                />
              </div>
              <div className="space-y-2">
                <Label>Cantidad de Mesas *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newRecinto.cantidadMesas}
                  onChange={(e) => setNewRecinto({ ...newRecinto, cantidadMesas: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localidad *</Label>
                <Select
                  value={newRecinto.localidadId?.toString() || ""}
                  onValueChange={(value) => setNewRecinto({ ...newRecinto, localidadId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {localidades.map((localidad) => (
                      <SelectItem key={localidad.id} value={localidad.id.toString()}>
                        {localidad.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Distrito Municipal</Label>
                <Select
                  value={newRecinto.distritoMunicipalId?.toString() || ""}
                  onValueChange={(value) => setNewRecinto({ ...newRecinto, distritoMunicipalId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosMunicipales.map((distrito) => (
                      <SelectItem key={distrito.id} value={distrito.id.toString()}>
                        {distrito.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Recinto</DialogTitle>
            <DialogDescription>
              Modifica los datos del recinto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Recinto *</Label>
                <Input
                  value={editRecinto.nombre || ""}
                  onChange={(e) => setEditRecinto({ ...editRecinto, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={editRecinto.codigo || ""}
                  onChange={(e) => setEditRecinto({ ...editRecinto, codigo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={editRecinto.direccion || ""}
                onChange={(e) => setEditRecinto({ ...editRecinto, direccion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coordenadas GPS</Label>
                <Input
                  value={editRecinto.coordenadasGps || ""}
                  onChange={(e) => setEditRecinto({ ...editRecinto, coordenadasGps: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cantidad de Mesas *</Label>
                <Input
                  type="number"
                  min={0}
                  value={editRecinto.cantidadMesas ?? 0}
                  onChange={(e) => setEditRecinto({ ...editRecinto, cantidadMesas: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localidad *</Label>
                <Select
                  value={editRecinto.localidadId?.toString() || ""}
                  onValueChange={(value) => setEditRecinto({ ...editRecinto, localidadId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {localidades.map((localidad) => (
                      <SelectItem key={localidad.id} value={localidad.id.toString()}>
                        {localidad.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Distrito Municipal</Label>
                <Select
                  value={editRecinto.distritoMunicipalId?.toString() || ""}
                  onValueChange={(value) => setEditRecinto({ ...editRecinto, distritoMunicipalId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosMunicipales.map((distrito) => (
                      <SelectItem key={distrito.id} value={distrito.id.toString()}>
                        {distrito.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
    </div>
  );
}