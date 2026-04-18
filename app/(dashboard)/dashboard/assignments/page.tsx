"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2, MapPin, Eye } from "lucide-react";
import { useRecintosPorUsuario } from "@/lib/hooks/useRecintos";
import { useProcess } from "@/lib/context/process-context";
import { VerAsignacionesModal } from "@/components/asignaciones/VerAsignacionesModal";
import type { Recinto } from "@/lib/types/recinto";

export default function RecintosPage() {
  const { hasSelectedProceso } = useProcess();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecintoId, setSelectedRecintoId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError } = useRecintosPorUsuario({
    page,
    limit: 20,
    search: searchTerm || undefined
  });

  // Obtener el recinto actualizado del data cuando cambia
  const selectedRecinto = useMemo(() => {
    if (!selectedRecintoId || !data?.data) return null;
    return data.data.find(r => r.id === selectedRecintoId) || null;
  }, [selectedRecintoId, data?.data]);

  const handleSearch = () => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleVerAsignaciones = (recinto: Recinto) => {
    setSelectedRecintoId(recinto.id);
    setModalOpen(true);
  };

  const recintos = data?.data || [];

  if (!hasSelectedProceso) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <MapPin className="h-10 w-10" />
        <p className="text-lg font-medium">Selecciona un proceso para ver los recintos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mis Recintos</h2>
        <p className="text-muted-foreground">
          Recintos asignados a tu usuario en este proceso.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recintos Asignados
          </CardTitle>
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
              Error al cargar los recintos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Acciones</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Localidad</TableHead>
                    <TableHead>Municipio</TableHead>
                    <TableHead className="text-center">Mesas</TableHead>
                    <TableHead>Jefe</TableHead>
                    <TableHead>Delegados</TableHead>
                    <TableHead>Estado</TableHead>
                    
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recintos && recintos.length > 0 ? (
                    recintos.map((recinto) => {
                     
                      const resumenDelegados = recinto.resumenDelegados || { titulares: 0, reservas: 0, total: 0 };
                      const cantidadMesas = recinto.mesas?.length || recinto.cantidadMesas || 0;
                      
                      return (
                        <TableRow key={recinto.id}>
                            <TableCell className="text-center">
                           <Button
  size="sm"
  onClick={() => handleVerAsignaciones(recinto)}
  className="bg-sky-600 hover:bg-sky-700 text-white"
>
  <Eye className="h-4 w-4 mr-1" />
  Ver Asignaciones
</Button>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{recinto.nombre}</div>
                            {recinto.direccion && (
                              <div className="text-sm text-muted-foreground">{recinto.direccion}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{recinto.codigo}</span>
                          </TableCell>
                          <TableCell>{recinto.localidad?.nombre || "N/A"}</TableCell>
                          <TableCell>{recinto.localidad?.municipio?.nombre || "N/A"}</TableCell>
                          <TableCell className="text-center">{cantidadMesas}</TableCell>

                          {/* Jefe */}
                          <TableCell>
                            {recinto.jefes && recinto.jefes.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                <span className="text-sm">
                                  {recinto.jefes[0].usuario?.nombres} {recinto.jefes[0].usuario?.apellidos}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                                <span className="text-sm text-muted-foreground">Sin asignar</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Delegados - con valores seguros */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5 text-sm">
                              <span>
                                <span className="text-muted-foreground">Titulares:</span>{" "}
                                <span className="font-medium">{resumenDelegados.titulares}</span>
                              </span>
                              <span>
                                <span className="text-muted-foreground">Reservas:</span>{" "}
                                <span className="font-medium">{resumenDelegados.reservas}</span>
                              </span>
                              <span className="border-t pt-0.5 mt-0.5">
                                <span className="text-muted-foreground">Total:</span>{" "}
                                <span className="font-medium">{resumenDelegados.total}</span>
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={recinto.estado === "activo" ? "default" : "secondary"}
                              className={recinto.estado === "activo" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                            >
                              {recinto.estado || "inactivo"}
                            </Badge>
                          </TableCell>

                        
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No se encontraron recintos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {data?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {data.pagination.page} de {data.pagination.totalPages} (
                    {data.pagination.totalItems} recintos)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}
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

      {/* Modal de asignaciones */}
      <VerAsignacionesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        recinto={selectedRecinto}
      />
    </div>
  );
}