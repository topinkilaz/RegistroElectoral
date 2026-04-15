"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Phone, User, ChevronDown, ChevronUp } from "lucide-react";
import { useReporteDuplicados } from "@/lib/hooks/useReporteDuplicados";
import { useProcess } from "@/lib/context/process-context";
import { Button } from "@/components/ui/button";

export default function DuplicadosPage() {
  const { procesoId } = useProcess();
  const [tipo, setTipo] = useState<"JEFE" | "DELEGADO" | "AMBOS">("JEFE");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useReporteDuplicados(
    procesoId ? {
      procesoId,
      tipo,
      orden: "asc",
      campoDuplicado: "WHATSAPP",
    } : null
  );

  const toggleGroup = (valor: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [valor]: !prev[valor]
    }));
  };

  const getTipoBadge = (tipoPersona: string) => {
    if (tipoPersona === "JEFE") {
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Jefe</Badge>;
    } else if (tipoPersona === "DELEGADO") {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Delegado</Badge>;
    }
    return <Badge variant="secondary">{tipoPersona}</Badge>;
  };

  const getSubtipoBadge = (subtipo: string) => {
    if (subtipo === "titular") {
      return <Badge variant="outline">Titular</Badge>;
    } else if (subtipo === "reserva") {
      return <Badge variant="outline">Reserva</Badge>;
    }
    return <Badge variant="outline">{subtipo}</Badge>;
  };

  if (!procesoId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personas Duplicadas</h2>
            <p className="text-muted-foreground">
              Reporte de personas que comparten el mismo número de WhatsApp
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Selecciona un proceso para ver el reporte de duplicados</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personas Duplicadas</h2>
            <p className="text-muted-foreground">
              Reporte de personas que comparten el mismo número de WhatsApp
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Cargando reporte de duplicados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personas Duplicadas</h2>
            <p className="text-muted-foreground">
              Reporte de personas que comparten el mismo número de WhatsApp
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-muted-foreground">Error al cargar el reporte de duplicados</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grupos = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personas Duplicadas</h2>
          <p className="text-muted-foreground">
            Reporte de personas que comparten el mismo número de WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tipo:</span>
            <Select value={tipo} onValueChange={(val) => setTipo(val as any)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEFE">Jefes</SelectItem>
                <SelectItem value="DELEGADO">Delegados</SelectItem>
                <SelectItem value="AMBOS">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Listado de Duplicados
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.totalGrupos} grupos, {data.totalRegistros} registros)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grupos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron duplicados
            </div>
          ) : (
            <div className="space-y-3">
              {grupos.map((grupo) => (
                <div key={grupo.valor} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleGroup(grupo.valor)}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-mono font-medium">{grupo.valor}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({grupo.total} registros)
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedGroups[grupo.valor] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {expandedGroups[grupo.valor] && (
                    <div className="border-t">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Nombre</TableHead>
                              <TableHead className="text-xs">CI</TableHead>
                              <TableHead className="text-xs">Tipo</TableHead>
                              <TableHead className="text-xs">Subtipo</TableHead>
                              <TableHead className="text-xs">Recinto/Mesa</TableHead>
                              <TableHead className="text-xs">Agrupación</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grupo.registros.map((registro, idx) => (
                              <TableRow key={idx} className="text-sm">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    {registro.nombre}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {registro.ci}
                                </TableCell>
                                <TableCell>{getTipoBadge(registro.tipo)}</TableCell>
                                <TableCell>{getSubtipoBadge(registro.subtipo)}</TableCell>
                                <TableCell className="text-xs">
                                  {registro.recinto && <div>{registro.recinto}</div>}
                                  {registro.mesa && <div className="text-muted-foreground">Mesa {registro.mesa}</div>}
                                  {!registro.recinto && !registro.mesa && "-"}
                                </TableCell>
                                <TableCell className="text-xs">{registro.agrupacion || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}