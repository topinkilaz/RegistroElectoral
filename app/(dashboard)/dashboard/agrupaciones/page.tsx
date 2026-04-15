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
  Download,
  Users,
  Eye,
  EyeOff,
  FileText,
  ArrowLeft,
  UserCheck,
  Phone,
  IdCard,
  MessageCircle,
  MapPin,
  CheckCircle2,
  XCircle,
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
  useAgrupaciones,
  useCreateAgrupacion,
  useUpdateAgrupacion,
  useExportarAgrupaciones,
  useDeleteAgrupacion,
  useAgrupacionesReporte,
  useAgrupacionReporteDetalle,
} from "@/lib/hooks/useAgrupaciones";
import type {
  Agrupacion,
  UpdateAgrupacionDto,
  EstadoAgrupacion,
  AgrupacionReporte,
} from "@/lib/types/agrupacion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProcess } from "@/lib/context/process-context";

export default function AgrupacionesPage() {
  const { proceso, procesoId, hasSelectedProceso } = useProcess();
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [selectedAgrupacion, setSelectedAgrupacion] =
    useState<Agrupacion | null>(null);
  const [selectedReporteId, setSelectedReporteId] = useState<number | null>(null);

  const [newAgrupacion, setNewAgrupacion] = useState({
    nombre: "",
    sigla: "",
  });
  const [editAgrupacion, setEditAgrupacion] = useState<UpdateAgrupacionDto>({});

  const { data, isLoading, isError, error } = useAgrupaciones({
    search: searchTerm || undefined,
  });

  const createMutation = useCreateAgrupacion();
  const updateMutation = useUpdateAgrupacion();
  const exportMutation = useExportarAgrupaciones();
  const deleteMutation = useDeleteAgrupacion();

  const { data: reporteData, isLoading: isLoadingReporte } = useAgrupacionesReporte();
  const { data: reporteDetalle, isLoading: isLoadingDetalle } = useAgrupacionReporteDetalle(selectedReporteId);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter(
      (agrupacion) =>
        agrupacion.nombre.toLowerCase().includes(searchLower) ||
        agrupacion.sigla?.toLowerCase().includes(searchLower),
    );
  }, [data, searchTerm]);

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
    if (!newAgrupacion.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    try {
      await createMutation.mutateAsync(newAgrupacion);
      toast.success("Agrupación creada exitosamente");
      setCreateModalOpen(false);
      setNewAgrupacion({ nombre: "", sigla: "" });
    } catch (error: any) {
      toast.error(error?.message || "Error al crear agrupación");
    }
  };

  const handleEdit = async () => {
    if (!selectedAgrupacion) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedAgrupacion.id,
        data: editAgrupacion,
      });
      toast.success("Agrupación actualizada exitosamente");
      setEditModalOpen(false);
      setSelectedAgrupacion(null);
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar agrupación");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agrupaciones_proceso_${procesoId}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Exportación completada exitosamente");
    } catch (error: any) {
      toast.error(error?.message || "Error al exportar agrupaciones");
    }
  };

  const handleToggleEstado = async (agrupacion: Agrupacion) => {
    const nuevoEstado: EstadoAgrupacion =
      agrupacion.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      await updateMutation.mutateAsync({
        id: agrupacion.id,
        data: { estado: nuevoEstado },
      });
      toast.success(
        `Agrupación ${nuevoEstado === "ACTIVO" ? "activada" : "desactivada"} exitosamente`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async (agrupacion: Agrupacion) => {
    if (
      confirm(
        `¿Está seguro de eliminar permanentemente la agrupación "${agrupacion.nombre}"?`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(agrupacion.id);
        toast.success("Agrupación eliminada exitosamente");
      } catch (error: any) {
        toast.error(error?.message || "Error al eliminar agrupación");
      }
    }
  };

  const openEditModal = (agrupacion: Agrupacion) => {
    setSelectedAgrupacion(agrupacion);
    setEditAgrupacion({
      nombre: agrupacion.nombre,
      sigla: agrupacion.sigla,
      estado: agrupacion.estado,
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

  if (!hasSelectedProceso) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay proceso seleccionado
              </h3>
              <p className="text-muted-foreground">
                Seleccione un proceso para ver las agrupaciones
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agrupaciones</h2>
          <p className="text-muted-foreground">
            Gestiona las agrupaciones del proceso:{" "}
            <strong>{proceso?.nombre}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setReporteModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Informes
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
            disabled={exportMutation.isPending || !filteredData.length}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Agrupación
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Todas las Agrupaciones</CardTitle>
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agrupaciones..."
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error al cargar agrupaciones: {error?.message}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Sigla</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No se encontraron agrupaciones con esa búsqueda"
                          : "No hay agrupaciones registradas"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((agrupacion) => (
                      <TableRow key={agrupacion.id}>
                        <TableCell className="font-mono text-xs">
                          {agrupacion.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {agrupacion.nombre}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agrupacion.sigla && (
                            <Badge variant="secondary">
                              {agrupacion.sigla}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              agrupacion.estado === "ACTIVO"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-gray-500/10 text-gray-500"
                            }
                          >
                            {agrupacion.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(agrupacion.createdAt)}
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
                                onClick={() => openEditModal(agrupacion)}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleEstado(agrupacion)}
                                className="flex items-center gap-2"
                              >
                                {agrupacion.estado === "ACTIVO" ? (
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
                                onClick={() => handleDelete(agrupacion)}
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

              {filteredData.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredData.length} agrupación
                    {filteredData.length !== 1 ? "es" : ""}
                    {searchTerm && ` (filtrado de ${data?.length || 0} total)`}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Agrupación</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar una nueva agrupación en el
              proceso {proceso?.nombre}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newAgrupacion.nombre}
                onChange={(e) =>
                  setNewAgrupacion({ ...newAgrupacion, nombre: e.target.value })
                }
                placeholder="Ej: DISTRITO 2"
              />
            </div>
            <div className="space-y-2">
              <Label>Sigla</Label>
              <Input
                value={newAgrupacion.sigla}
                onChange={(e) =>
                  setNewAgrupacion({ ...newAgrupacion, sigla: e.target.value })
                }
                placeholder="Ej: D2"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Máximo 20 caracteres.
              </p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agrupación</DialogTitle>
            <DialogDescription>
              Modifica los datos de la agrupación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editAgrupacion.nombre || ""}
                onChange={(e) =>
                  setEditAgrupacion({
                    ...editAgrupacion,
                    nombre: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sigla</Label>
              <Input
                value={editAgrupacion.sigla || ""}
                onChange={(e) =>
                  setEditAgrupacion({
                    ...editAgrupacion,
                    sigla: e.target.value,
                  })
                }
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={editAgrupacion.estado || "ACTIVO"}
                onValueChange={(value: EstadoAgrupacion) =>
                  setEditAgrupacion({ ...editAgrupacion, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                  <SelectItem value="INACTIVO">INACTIVO</SelectItem>
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

      <Dialog
        open={reporteModalOpen}
        onOpenChange={(open) => {
          setReporteModalOpen(open);
          if (!open) setSelectedReporteId(null);
        }}
      >
        <DialogContent className="!max-w-[60vw] !w-[60vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReporteId ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedReporteId(null)}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span>Detalle de {reporteDetalle?.agrupacion.nombre}</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Informes de Agrupaciones</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedReporteId
                ? "Información detallada de jefes de recinto y delegados"
                : "Resumen de jefes de recinto, delegados titulares, reservas y total de personas por agrupación"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto max-h-[70vh]">
            {!selectedReporteId ? (
              <div className="space-y-4">
                {isLoadingReporte ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reporteData && reporteData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agrupación</TableHead>
                        <TableHead className="text-center">Jefes Recinto</TableHead>
                        <TableHead className="text-center">Titulares</TableHead>
                        <TableHead className="text-center">Reservas</TableHead>
                        <TableHead className="text-center">Total Delegados</TableHead>
                        <TableHead className="text-center">Total Personas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporteData.map((item: AgrupacionReporte) => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.nombre}</span>
                              {item.sigla && (
                                <span className="text-xs text-muted-foreground">{item.sigla}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.jefesRecinto}
                          </TableCell>
                          <TableCell className="text-center font-medium text-green-600">
                            {item.delegados.titulares}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {item.delegados.reservas}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.delegados.total}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {item.totalPersonas}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReporteId(item.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos de reportes disponibles
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {isLoadingDetalle ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reporteDetalle ? (
                  <>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold">{reporteDetalle.resumen.jefesRecinto}</p>
                        <p className="text-xs text-muted-foreground">Jefes de Recinto</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{reporteDetalle.resumen.titulares}</p>
                        <p className="text-xs text-muted-foreground">Titulares</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">{reporteDetalle.resumen.reservas}</p>
                        <p className="text-xs text-muted-foreground">Reservas</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg bg-primary/5">
                        <p className="text-2xl font-bold text-primary">{reporteDetalle.resumen.totalPersonas}</p>
                        <p className="text-xs text-muted-foreground">Total Personas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">En Grupo WhatsApp</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Jefes: <strong>{reporteDetalle.resumen.enGrupoWhatsapp.jefes}</strong> / {reporteDetalle.resumen.jefesRecinto}</span>
                          <span>Delegados: <strong>{reporteDetalle.resumen.enGrupoWhatsapp.delegados}</strong> / {reporteDetalle.resumen.totalDelegados}</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <IdCard className="h-4 w-4" />
                          <span className="text-sm font-medium">Con Fotocopia Carnet</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Jefes: <strong>{reporteDetalle.resumen.tieneFotocopiaCarnet.jefes}</strong> / {reporteDetalle.resumen.jefesRecinto}</span>
                          <span>Delegados: <strong>{reporteDetalle.resumen.tieneFotocopiaCarnet.delegados}</strong> / {reporteDetalle.resumen.totalDelegados}</span>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="jefes" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="jefes" className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Jefes de Recinto
                        </TabsTrigger>
                        <TabsTrigger value="delegados" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Delegados ({reporteDetalle.delegados.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="jefes" className="mt-3 space-y-2">
                        {reporteDetalle.jefesRecinto.map((jefe) => (
                          <div key={jefe.id} className="border rounded-lg p-3">
                            <div className="flex flex-wrap justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {jefe.usuario.nombres} {jefe.usuario.apellidos}
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                  <span>CI: {jefe.usuario.numDocumento}</span>
                                  <span>📞 {jefe.usuario.celular}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <p>{jefe.recinto.nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                  {jefe.recinto.localidad.nombre}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {jefe.enGrupoWhatsapp && (
                                  <span className="text-xs text-green-600">✓ Grupo WhatsApp</span>
                                )}
                                {jefe.tieneFotocopiaCarnet && (
                                  <span className="text-xs text-blue-600">✓ Fotocopia Carnet</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {reporteDetalle.jefesRecinto.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No hay jefes de recinto registrados</p>
                        )}
                      </TabsContent>

                      <TabsContent value="delegados" className="mt-3 space-y-2">
                        {reporteDetalle.delegados.map((delegado) => (
                          <div key={delegado.id} className="border rounded-lg p-3">
                            <div className="flex flex-wrap justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {delegado.usuario.nombres} {delegado.usuario.apellidos}
                                  </p>
                                  <Badge variant="secondary" className="text-xs">
                                    {delegado.tipo}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                  <span>CI: {delegado.usuario.numDocumento}</span>
                                  <span>📞 {delegado.usuario.celular}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                {delegado.mesa ? (
                                  <>
                                    <p>Mesa {delegado.mesa.numero}</p>
                                    <p className="text-xs text-muted-foreground">{delegado.mesa.recinto.nombre}</p>
                                  </>
                                ) : delegado.jefeRecinto ? (
                                  <p className="text-xs">Jefe de {delegado.jefeRecinto.recinto.nombre}</p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Sin asignación</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {delegado.enGrupoWhatsapp && (
                                  <span className="text-xs text-green-600">✓ WhatsApp</span>
                                )}
                                {delegado.tieneFotocopiaCarnet && (
                                  <span className="text-xs text-blue-600">✓ Carnet</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {reporteDetalle.delegados.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No hay delegados registrados</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Error al cargar el detalle
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setReporteModalOpen(false);
                setSelectedReporteId(null);
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}