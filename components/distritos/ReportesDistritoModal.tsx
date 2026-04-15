"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Users, Building2, AlertTriangle, BarChart3 } from "lucide-react";
import {
  useReporteResumen,
  useReporteRecintos,
  useReportePersonas,
  useReporteFaltantes,
} from "@/lib/hooks/useReportesDistrito";
import type { DistritoMunicipal } from "@/lib/types/distritos";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distritos: DistritoMunicipal[];

  procesos?: { id: number; nombre: string }[];
  defaultProcesoId?: number;
}

export default function ReportesDistritoModal({
  open,
  onOpenChange,
  distritos,
  procesos = [],
  defaultProcesoId = 1,
}: Props) {
  const [activeTab, setActiveTab] = useState("resumen");
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [procesoId, setProcesoId] = useState<number>(defaultProcesoId);

  const resumenMutation = useReporteResumen();
  const recintosMutation = useReporteRecintos();
  const personasMutation = useReportePersonas();
  const faltantesMutation = useReporteFaltantes();

  const mutationByTab = {
    resumen: resumenMutation,
    recintos: recintosMutation,
    personas: personasMutation,
    faltantes: faltantesMutation,
  };

  const fetchTabData = (tab: string, dId: number, pId: number) => {
    const params = { procesoId: pId, distritoId: dId };
    if (tab === "resumen") resumenMutation.mutate(params);
    else if (tab === "recintos") recintosMutation.mutate(params);
    else if (tab === "personas") personasMutation.mutate(params);
    else if (tab === "faltantes") faltantesMutation.mutate(params);
  };

  const handleDistritoChange = (value: string) => {
    const id = parseInt(value);
    setDistritoId(id);
    fetchTabData(activeTab, id, procesoId);
  };

  const handleProcesoChange = (value: string) => {
    const id = parseInt(value);
    setProcesoId(id);
    if (distritoId) fetchTabData(activeTab, distritoId, id);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (distritoId) fetchTabData(tab, distritoId, procesoId);
  };

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setDistritoId(null);
      setActiveTab("resumen");
      resumenMutation.reset();
      recintosMutation.reset();
      personasMutation.reset();
      faltantesMutation.reset();
    }
  }, [open]);

  const currentMutation = mutationByTab[activeTab as keyof typeof mutationByTab];
  const isLoading = currentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="!max-w-[60vw] !w-[60vw] max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0">
  <DialogTitle className="flex items-center gap-2">
    <BarChart3 className="h-4 w-4" />
    Reportes de Distrito
  </DialogTitle>
</DialogHeader>

{/* Filtros */}
<div className="flex items-center gap-3 px-6 pb-3 shrink-0">
  {procesos.length > 0 && (
    <div className="space-y-1">
      <Label className="text-xs">Proceso</Label>
      <Select value={procesoId.toString()} onValueChange={handleProcesoChange}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Seleccionar proceso" />
        </SelectTrigger>
        <SelectContent>
          {procesos.map((p) => (
            <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
              {p.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}
  <div className="space-y-1">
    <Label className="text-xs">Distrito *</Label>
    <Select
      value={distritoId?.toString() || ""}
      onValueChange={handleDistritoChange}
    >
      <SelectTrigger className="w-56 h-8 text-xs">
        <SelectValue placeholder="Seleccionar distrito" />
      </SelectTrigger>
      <SelectContent>
        {distritos.map((d) => (
          <SelectItem key={d.id} value={d.id.toString()} className="text-xs">
            {d.nombre} — {d.municipio.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  {!distritoId && (
    <p className="text-xs text-muted-foreground mt-4">
      Selecciona un distrito para ver los reportes
    </p>
  )}
</div>

<Tabs
  value={activeTab}
  onValueChange={handleTabChange}
  className="flex flex-col flex-1 overflow-hidden px-6 pb-5"
>
  <TabsList className="w-full shrink-0 h-8">
    <TabsTrigger value="resumen" className="flex-1 text-xs">Resumen</TabsTrigger>
    <TabsTrigger value="recintos" className="flex-1 text-xs">Recintos</TabsTrigger>
    <TabsTrigger value="personas" className="flex-1 text-xs">Personas</TabsTrigger>
    <TabsTrigger value="faltantes" className="flex-1 text-xs">Faltantes</TabsTrigger>
  </TabsList>

  <div className="flex-1 overflow-y-auto mt-3">
    <TabsContent value="resumen" className="mt-0">
      {isLoading && activeTab === "resumen" ? <LoadingState /> : resumenMutation.data ? <ResumenTab data={resumenMutation.data.data} /> : <EmptyState />}
    </TabsContent>
    <TabsContent value="recintos" className="mt-0">
      {isLoading && activeTab === "recintos" ? <LoadingState /> : recintosMutation.data ? <RecintosTab data={recintosMutation.data} /> : <EmptyState />}
    </TabsContent>
    <TabsContent value="personas" className="mt-0">
      {isLoading && activeTab === "personas" ? <LoadingState /> : personasMutation.data ? <PersonasTab data={personasMutation.data} /> : <EmptyState />}
    </TabsContent>
    <TabsContent value="faltantes" className="mt-0">
      {isLoading && activeTab === "faltantes" ? <LoadingState /> : faltantesMutation.data ? <FaltantesTab data={faltantesMutation.data.data} /> : <EmptyState />}
    </TabsContent>
  </div>
</Tabs>
      </DialogContent>
    </Dialog>
  );
}



function LoadingState() {
  return (
    <div className="flex justify-center items-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <BarChart3 className="h-10 w-10 opacity-30" />
      <p className="text-sm">Selecciona un distrito para cargar el reporte</p>
    </div>
  );
}



function ResumenTab({ data }: { data: any }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between py-1.5 border-b">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Recintos</span>
        </div>
        <div className="flex gap-4 text-xs">
          <span>Total: <span className="font-semibold">{data.recintos.total}</span></span>
          <span className="text-green-600">Con jefe: {data.recintos.conJefe.valor} ({data.recintos.conJefe.porcentaje}%)</span>
          <span className="text-red-500">Sin jefe: {data.recintos.sinJefe.valor} ({data.recintos.sinJefe.porcentaje}%)</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-1.5 border-b">
        <span className="text-xs font-medium">Mesas</span>
        <div className="flex gap-4 text-xs">
          <span className="text-green-600">Cubiertas: {data.mesas.cobertura.cubiertas}/{data.mesas.cobertura.total} ({data.mesas.cobertura.porcentaje}%)</span>
          <span className="text-red-500">Vacías: {data.mesas.vacias}</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-1.5 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Delegados</span>
        </div>
        <div className="flex gap-4 text-xs">
          <span>Total: <span className="font-semibold">{data.delegados.total}</span></span>
          <span>Con reserva: {data.delegados.reserva}</span>
          <span>Sin reserva: {data.delegados.sinReserva}</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-1.5 border-b">
        <span className="text-xs font-medium">Personas</span>
        <div className="flex gap-4 text-xs">
          <span>Total: <span className="font-semibold">{data.personas.total}</span></span>
          <span>Jefes: {data.personas.jefes}</span>
          <span>Delegados: {data.personas.delegados}</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-1.5">
        <span className="text-xs font-medium">Extras</span>
        <div className="flex gap-4 text-xs">
          <span>Grupo WhatsApp: <span className="font-semibold">{data.extras.grupoWhatsapp}</span></span>
          <span>Fotocopia carnet: <span className="font-semibold">{data.extras.fotocopiaCarnet}</span></span>
        </div>
      </div>
    </div>
  );
}

function RecintosTab({ data }: { data: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Total: <span className="font-semibold text-foreground">{data.total}</span> recintos
      </p>
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="py-1.5">Recinto</TableHead>
            <TableHead className="py-1.5 w-28">Localidad</TableHead>
            <TableHead className="py-1.5 w-8 text-center">Circ.</TableHead>
            <TableHead className="py-1.5 w-8 text-center">Dist.</TableHead>
            <TableHead className="py-1.5 w-36 text-center">Jefe</TableHead>
            <TableHead className="py-1.5 w-20 text-center">Cobertura</TableHead>
            <TableHead className="py-1.5 w-16 text-center">Reservas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((r: any) => (
            <TableRow key={r.id} className="text-xs">
              <TableCell className="py-1.5 font-medium">{r.nombre}</TableCell>
              <TableCell className="py-1.5 text-muted-foreground">{r.localidad}</TableCell>
              <TableCell className="py-1.5 text-center">{r.circ}</TableCell>
              <TableCell className="py-1.5 text-center">{r.distrito}</TableCell>
              <TableCell className="py-1.5 text-center">
                {r.jefe.existe ? (
                  <span className="flex items-center gap-1 justify-center text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[100px]">{r.jefe.data?.nombre}</span>
                  </span>
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400 mx-auto" />
                )}
              </TableCell>
              <TableCell className="py-1.5 text-center">
                <Badge
                  variant={r.cobertura.cubiertas === r.cobertura.total ? "default" : "secondary"}
                  className="text-xs px-1.5 py-0"
                >
                  {r.cobertura.cubiertas}/{r.cobertura.total}
                </Badge>
              </TableCell>
              <TableCell className="py-1.5 text-center">{r.reservas}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


function PersonasTab({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 rounded-md">
        <span className="text-xs font-medium">Total Recintos</span>
        <span className="text-sm font-bold">{data.totalRecintos}</span>
      </div>
      
      {data.data.map((item: any, idx: number) => (
        <div key={idx} className="space-y-2">
          <div className="bg-primary/5 px-3 py-1.5 rounded-md -mx-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold">{item.recinto.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {item.recinto.ubicacion}
              </span>
              <div className="flex gap-2 ml-auto">
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Circ. {item.recinto.circ}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Dist. {item.recinto.distrito}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pl-3">
            {item.jefes.titulares.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Jefe de Recinto</p>
                </div>
                {item.jefes.titulares.map((j: any, i: number) => (
                  <PersonaRow key={i} persona={j} variant="jefe" />
                ))}
              </div>
            )}
            
            {item.delegados.porMesa.map((m: any) => (
              <div key={m.mesa}>
                <div className="flex items-center gap-2 mb-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mesa {m.mesa}</p>
                </div>
                {m.delegados.titulares.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground pl-4 py-1">Sin delegados asignados</p>
                ) : (
                  m.delegados.titulares.map((d: any, i: number) => (
                    <PersonaRow key={i} persona={d} variant="delegado" />
                  ))
                )}
              </div>
            ))}
          </div>
          
          {idx < data.data.length - 1 && (
            <div className="my-3 border-t border-dashed" />
          )}
        </div>
      ))}
    </div>
  );
}

function PersonaRow({ persona, variant }: { persona: any; variant?: "jefe" | "delegado" }) {
  const bgColor = variant === "jefe" ? "hover:bg-green-50 dark:hover:bg-green-950/20" : "hover:bg-blue-50 dark:hover:bg-blue-950/20";
  
  return (
    <div className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-md transition-colors ${bgColor}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-medium">{persona.nombre}</span>
        <span className="text-muted-foreground font-mono text-xs">CI: {persona.ci}</span>
        {persona.celular && (
          <span className="text-muted-foreground text-xs">{persona.celular}</span>
        )}
        {persona.agrupacion && (
          <span className="text-muted-foreground text-xs bg-muted/50 px-1.5 py-0.5 rounded">
            {persona.agrupacion}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {persona.grupoWhatsapp === 1 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            WhatsApp
          </span>
        )}
        {persona.fotocopiaCarnet === 1 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            Fotocopia CI
          </span>
        )}
      </div>
    </div>
  );
}
function FaltantesTab({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2 pb-1 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recintos sin Jefe</span>
          </div>
          <Badge variant="destructive" className="text-xs px-1.5 py-0">
            {data.recintosSinJefe.total}
          </Badge>
        </div>
        
        {data.recintosSinJefe.items.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-green-600 py-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Todos los recintos tienen jefe</span>
          </div>
        ) : (
          <div className="space-y-1">
            {data.recintosSinJefe.items.map((r: any) => (
              <div key={r.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="font-medium">{r.nombre}</span>
                <span className="text-muted-foreground text-[10px] font-mono ml-auto">ID: {r.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 pb-1 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mesas sin Delegado</span>
          </div>
          <Badge variant="destructive" className="text-xs px-1.5 py-0">
            {data.mesasSinDelegado.total}
          </Badge>
        </div>
        
        {data.mesasSinDelegado.items.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-green-600 py-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Todas las mesas tienen delegado</span>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Mesa</th>
                  <th className="text-left py-2 px-3 font-medium">Recinto</th>
                  <th className="text-left py-2 px-3 font-medium">Municipio</th>
                  <th className="text-left py-2 px-3 font-medium">Distrito</th>
                </tr>
              </thead>
              <tbody>
                {data.mesasSinDelegado.items.map((m: any, i: number) => (
                  <tr key={i} className="border-t hover:bg-muted/30">
                    <td className="py-1.5 px-3 font-mono">#{m.mesa}</td>
                    <td className="py-1.5 px-3">{m.recinto}</td>
                    <td className="py-1.5 px-3">{m.municipio}</td>
                    <td className="py-1.5 px-3">{m.distrito}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}