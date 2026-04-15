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
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Recintos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{data.recintos.total}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Con jefe</span><span className="font-semibold text-green-600">{data.recintos.conJefe.valor} <span className="font-normal">({data.recintos.conJefe.porcentaje}%)</span></span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sin jefe</span><span className="font-semibold text-red-500">{data.recintos.sinJefe.valor} <span className="font-normal">({data.recintos.sinJefe.porcentaje}%)</span></span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium">Mesas</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Cubiertas</span><span className="font-semibold text-green-600">{data.mesas.cobertura.cubiertas}/{data.mesas.cobertura.total} <span className="font-normal">({data.mesas.cobertura.porcentaje}%)</span></span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vacías</span><span className="font-semibold text-red-500">{data.mesas.vacias}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Delegados
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{data.delegados.total}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Con reserva</span><span className="font-semibold">{data.delegados.reserva}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sin reserva</span><span className="font-semibold">{data.delegados.sinReserva}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium">Personas</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{data.personas.total}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Jefes</span><span className="font-semibold">{data.personas.jefes}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delegados</span><span className="font-semibold">{data.personas.delegados}</span></div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium">Extras</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 grid grid-cols-2 gap-x-6 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Grupo WhatsApp</span><span className="font-semibold">{data.extras.grupoWhatsapp}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Fotocopia carnet</span><span className="font-semibold">{data.extras.fotocopiaCarnet}</span></div>
        </CardContent>
      </Card>
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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Total recintos: <span className="font-semibold text-foreground">{data.totalRecintos}</span>
      </p>
      {data.data.map((item: any, idx: number) => (
        <Card key={idx}>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {item.recinto.nombre}
              <span className="font-normal text-muted-foreground">
                · {item.recinto.ubicacion} · Circ. {item.recinto.circ} · Dist. {item.recinto.distrito}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-3 pb-2 space-y-2">
            {item.jefes.titulares.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Jefe de Recinto</p>
                {item.jefes.titulares.map((j: any, i: number) => (
                  <PersonaRow key={i} persona={j} />
                ))}
              </div>
            )}
            {item.delegados.porMesa.map((m: any) => (
              <div key={m.mesa}>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Mesa {m.mesa}</p>
                {m.delegados.titulares.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground pl-2">Sin delegados</p>
                ) : (
                  m.delegados.titulares.map((d: any, i: number) => (
                    <PersonaRow key={i} persona={d} />
                  ))
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PersonaRow({ persona }: { persona: any }) {
  return (
    <div className="flex items-center justify-between text-xs py-0.5 px-2 rounded hover:bg-muted/50">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium truncate">{persona.nombre}</span>
        <span className="text-muted-foreground shrink-0">CI: {persona.ci}</span>
        {persona.celular && <span className="text-muted-foreground shrink-0">{persona.celular}</span>}
        {persona.agrupacion && <span className="text-muted-foreground shrink-0 truncate max-w-[100px]">{persona.agrupacion}</span>}
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {persona.grupoWhatsapp === 1 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">WA</Badge>}
        {persona.fotocopiaCarnet === 1 && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">CI</Badge>}
      </div>
    </div>
  );
}

function FaltantesTab({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            Recintos sin Jefe
            <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
              {data.recintosSinJefe.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-3 pb-2">
          {data.recintosSinJefe.items.length === 0 ? (
            <p className="text-xs text-muted-foreground">✓ Todos los recintos tienen jefe</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {data.recintosSinJefe.items.map((r: any) => (
                <div key={r.id} className="text-xs flex items-center gap-1.5 py-0.5">
                  <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                  <span className="truncate">{r.nombre}</span>
                  <span className="text-muted-foreground font-mono ml-auto shrink-0">#{r.id}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            Mesas sin Delegado
            <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
              {data.mesasSinDelegado.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-1 px-3 pb-2">
          {data.mesasSinDelegado.items.length === 0 ? (
            <p className="text-xs text-muted-foreground">✓ Todas las mesas tienen delegado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="py-1 h-7">Mesa</TableHead>
                  <TableHead className="py-1 h-7">Recinto</TableHead>
                  <TableHead className="py-1 h-7">Municipio</TableHead>
                  <TableHead className="py-1 h-7">Distrito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.mesasSinDelegado.items.map((m: any, i: number) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="py-1">{m.mesa}</TableCell>
                    <TableCell className="py-1">{m.recinto}</TableCell>
                    <TableCell className="py-1">{m.municipio}</TableCell>
                    <TableCell className="py-1">{m.distrito}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}