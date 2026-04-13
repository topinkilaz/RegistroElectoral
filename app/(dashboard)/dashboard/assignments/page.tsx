"use client";

import { useState } from "react";
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
import { Search, ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react";
import { useRecintosPorUsuario } from "@/lib/hooks/useRecintos";
import { useProcess } from "@/lib/context/process-context";

export default function RecintosPage() {
  const { hasSelectedProceso } = useProcess();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useRecintosPorUsuario({ page, limit: 20 });

  const handleSearch = () => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const filtered = data?.data.filter((r) =>
    searchTerm
      ? r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.localidad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

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
  {filtered && filtered.length > 0 ? (
    filtered.map((recinto) => (
      <TableRow key={recinto.id}>
        <TableCell>
          <div className="font-medium">{recinto.nombre}</div>
          {recinto.direccion && (
            <div className="text-sm text-muted-foreground">{recinto.direccion}</div>
          )}
        </TableCell>
        <TableCell>
          <span className="font-mono text-sm">{recinto.codigo}</span>
        </TableCell>
        <TableCell>{recinto.localidad.nombre}</TableCell>
        <TableCell>{recinto.localidad.municipio.nombre}</TableCell>
        <TableCell className="text-center">{recinto.cantidadMesas}</TableCell>

        {/* Jefe */}
        <TableCell>
          {recinto.jefe ? (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm">{recinto.jefe}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
              <span className="text-sm text-muted-foreground">Sin asignar</span>
            </div>
          )}
        </TableCell>

        {/* Delegados */}
        <TableCell>
          <div className="flex flex-col gap-0.5 text-sm">
            <span>
              <span className="text-muted-foreground">Titulares:</span>{" "}
              <span className="font-medium">{recinto.delegados.titulares}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Reservas:</span>{" "}
              <span className="font-medium">{recinto.delegados.reservas}</span>
            </span>
            <span className="border-t pt-0.5 mt-0.5">
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">{recinto.delegados.total}</span>
            </span>
          </div>
        </TableCell>

        <TableCell>
          <Badge
            variant={recinto.estado === "activo" ? "default" : "secondary"}
            className={recinto.estado === "activo" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
          >
            {recinto.estado}
          </Badge>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
}