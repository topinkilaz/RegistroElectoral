"use client";

import { useState, useMemo } from "react";
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
  Loader2,
  MapPin,
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
  useDistritos,
  useCreateDistrito,
  useUpdateDistrito,
  useDeleteDistrito,
} from "@/lib/hooks/useDistritos";
import { useListasGeograficas } from "@/lib/hooks/useAlcances";
import type {
  DistritoMunicipal,
  UpdateDistritoDto,
} from "@/lib/types/distritos";
import { FileBarChart2 } from "lucide-react";
import ReportesDistritoModal from "@/components/distritos/ReportesDistritoModal";

export default function DistritosPage() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDistrito, setSelectedDistrito] =
    useState<DistritoMunicipal | null>(null);
    const [reportesModalOpen, setReportesModalOpen] = useState(false);

  const [newDistrito, setNewDistrito] = useState({
    nombre: "",
    codigo: "",
    municipioId: 0,
  });
  const [editDistrito, setEditDistrito] = useState<UpdateDistritoDto>({});

  // Obtener distritos
  const { data: distritos, isLoading, isError, error } = useDistritos();

  // Obtener municipios del hook existente
  const { municipios, isLoading: isLoadingMunicipios } =
    useListasGeograficas(true);

  const createMutation = useCreateDistrito();
  const updateMutation = useUpdateDistrito();
  const deleteMutation = useDeleteDistrito();


  const filteredDistritos = useMemo(() => {
    if (!distritos) return [];
    if (!searchTerm) return distritos;

    const searchLower = searchTerm.toLowerCase();
    return distritos.filter(
      (distrito) =>
        distrito.nombre.toLowerCase().includes(searchLower) ||
        distrito.codigo?.toLowerCase().includes(searchLower) ||
        distrito.municipio.nombre.toLowerCase().includes(searchLower),
    );
  }, [distritos, searchTerm]);

  const handleSearch = () => {
    setSearchTerm(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchTerm("");
  };

  const handleCreate = async () => {
    if (!newDistrito.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!newDistrito.codigo.trim()) {
      toast.error("El código es requerido");
      return;
    }
    if (!newDistrito.municipioId || newDistrito.municipioId === 0) {
      toast.error("Debe seleccionar un municipio");
      return;
    }

    try {
      await createMutation.mutateAsync(newDistrito);
      toast.success("Distrito creado exitosamente");
      setCreateModalOpen(false);
      setNewDistrito({
        nombre: "",
        codigo: "",
        municipioId: 0,
      });
    } catch (error: any) {
      toast.error(error?.message || "Error al crear distrito");
    }
  };

  const handleEdit = async () => {
    if (!selectedDistrito) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedDistrito.id,
        data: editDistrito,
      });
      toast.success("Distrito actualizado exitosamente");
      setEditModalOpen(false);
      setSelectedDistrito(null);
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar distrito");
    }
  };

  const handleDelete = async (distrito: DistritoMunicipal) => {
    if (
      confirm(
        `¿Está seguro de eliminar permanentemente el distrito "${distrito.nombre}"?`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(distrito.id);
        toast.success("Distrito eliminado exitosamente");
      } catch (error: any) {
        toast.error(error?.message || "Error al eliminar distrito");
      }
    }
  };

  const openEditModal = (distrito: DistritoMunicipal) => {
    setSelectedDistrito(distrito);
    setEditDistrito({
      nombre: distrito.nombre,
      codigo: distrito.codigo,
      municipioId: distrito.municipio.id,
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Distritos Municipales
          </h2>
          <p className="text-muted-foreground">
            Gestiona los distritos municipales del sistema.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Distrito
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>Todos los Distritos</CardTitle>
  <div className="flex items-center gap-3 w-auto">
    <Button
      variant="outline"
      onClick={() => setReportesModalOpen(true)}
      className="flex items-center gap-2"
      disabled={!distritos || distritos.length === 0}
    >
      <FileBarChart2 className="h-4 w-4" />
      Reportes
    </Button>
    <div className="flex items-center gap-2">
      <div className="relative flex-1 w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, código o municipio..."
          className="pl-8 pr-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      <Button onClick={handleSearch} size="sm">
        Buscar
      </Button>
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
              Error al cargar distritos: {error?.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Municipio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistritos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No se encontraron distritos con esa búsqueda"
                          : "No hay distritos registrados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDistritos.map((distrito) => (
                      <TableRow key={distrito.id}>
                        <TableCell className="font-mono text-xs">
                          {distrito.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {distrito.nombre}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{distrito.codigo}</Badge>
                        </TableCell>
                        <TableCell>{distrito.municipio.nombre}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditModal(distrito)}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(distrito)}
                                className="flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar Permanentemente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {filteredDistritos.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredDistritos.length} distrito
                    {filteredDistritos.length !== 1 ? "s" : ""}
                    {searchTerm &&
                      ` (filtrado de ${distritos?.length || 0} total)`}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Distrito Municipal</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un nuevo distrito municipal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newDistrito.nombre}
                onChange={(e) =>
                  setNewDistrito({ ...newDistrito, nombre: e.target.value })
                }
                placeholder="Ej: 1, 2, Centro, Norte"
              />
            </div>
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input
                value={newDistrito.codigo}
                onChange={(e) =>
                  setNewDistrito({ ...newDistrito, codigo: e.target.value })
                }
                placeholder="Ej: D_1, D-001"
              />
              <p className="text-xs text-muted-foreground">
                Código único identificador del distrito.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Municipio *</Label>
              <Select
                value={newDistrito.municipioId?.toString() || ""}
                onValueChange={(value) =>
                  setNewDistrito({
                    ...newDistrito,
                    municipioId: parseInt(value),
                  })
                }
                disabled={isLoadingMunicipios}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un municipio" />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((municipio: any) => (
                    <SelectItem
                      key={municipio.id}
                      value={municipio.id.toString()}
                    >
                      {municipio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingMunicipios && (
                <p className="text-xs text-muted-foreground">
                  Cargando municipios...
                </p>
              )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Distrito Municipal</DialogTitle>
            <DialogDescription>
              Modifica los datos del distrito municipal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editDistrito.nombre || ""}
                onChange={(e) =>
                  setEditDistrito({ ...editDistrito, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={editDistrito.codigo || ""}
                onChange={(e) =>
                  setEditDistrito({ ...editDistrito, codigo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Municipio</Label>
              <Select
                value={editDistrito.municipioId?.toString() || ""}
                onValueChange={(value) =>
                  setEditDistrito({
                    ...editDistrito,
                    municipioId: parseInt(value),
                  })
                }
                disabled={isLoadingMunicipios}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un municipio" />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((municipio: any) => (
                    <SelectItem
                      key={municipio.id}
                      value={municipio.id.toString()}
                    >
                      {municipio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <ReportesDistritoModal
  open={reportesModalOpen}
  onOpenChange={setReportesModalOpen}
  distritos={distritos || []}
  defaultProcesoId={1} 
/>
    </div>
  );
}
