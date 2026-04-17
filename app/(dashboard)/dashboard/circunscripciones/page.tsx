"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useCircunscripciones } from "@/lib/hooks/useCircunscripciones";
import { useProcess } from "@/lib/context/process-context";

export default function CircunscripcionesPage() {
  const { procesoId } = useProcess();
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: circunscripciones, isLoading, isError, error } = useCircunscripciones(procesoId || undefined, !!procesoId);

  const handleSearch = () => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchTerm("");
    setPage(1);
  };

  const filteredCircunscripciones = circunscripciones?.filter(circ =>
    circ.numero.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const paginatedData = filteredCircunscripciones.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredCircunscripciones.length / limit);

  if (isError) {
    toast.error(error?.message || "Error al cargar circunscripciones");
  }

  if (!procesoId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Hash className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Selecciona un proceso para ver las circunscripciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Circunscripciones</h2>
          <p className="text-muted-foreground">
            Lista de circunscripciones registradas en el sistema.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Todas las Circunscripciones</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar circunscripción..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} size="sm">
                Buscar
              </Button>
              {searchTerm && (
                <Button onClick={handleClearSearch} variant="ghost" size="sm">
                  Limpiar
                </Button>
              )}
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
              Error al cargar circunscripciones
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Departamento ID</TableHead>
                    <TableHead>Municipio ID</TableHead>
                    <TableHead>Proceso ID</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((circ) => (
                      <TableRow key={circ.id}>
                        <TableCell className="font-mono text-xs">
                          {circ.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Circunscripción {circ.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {circ.departamentoId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {circ.municipioId || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {circ.procesoId}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(circ.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={!circ.eliminado ? "default" : "secondary"}
                            className={
                              !circ.eliminado
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {!circ.eliminado ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No se encontraron circunscripciones" : "No hay circunscripciones registradas"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({filteredCircunscripciones.length} circunscripciones)
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
    </div>
  );
}