"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  UserCheck,
  UserX,
  LayoutGrid,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useProcess } from "@/lib/context/process-context";
import { useReporteResultado } from "@/lib/hooks/useReportes";
import { useListasGeograficas } from "@/lib/hooks/useAlcances";
import { api } from "@/lib/api/axios";
import ReactSelect from "react-select";

export default function DashboardPage() {
  const { procesoId } = useProcess();
  const [searchTerm, setSearchTerm] = useState("");
  const [incluirVacios, setIncluirVacios] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);

  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [circunscripcionId, setCircunscripcionId] = useState<number | null>(null);
  const [municipioId, setMunicipioId] = useState<number | null>(null);
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [localidadId, setLocalidadId] = useState<number | null>(null);

  const {
    provincias,
    circunscripciones,
    municipios,
    distritosMunicipales,
    localidades,
    isLoading: isLoadingListas,
  } = useListasGeograficas(!!procesoId);

  const { data: reporte, isLoading, error } = useReporteResultado(
    procesoId ? {
      procesoId,
      provinciaId: provinciaId || undefined,
      circunscripcionId: circunscripcionId || undefined,
      municipioId: municipioId || undefined,
      distritoId: distritoId || undefined,
      localidadId: localidadId || undefined,
    } : null
  );

  const localidadOptions = localidades.map(localidad => ({
    value: localidad.id,
    label: localidad.nombre
  }));

  const selectedFilterLocalidad = localidadOptions.find(
    opt => opt.value === localidadId
  );

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

  const resetFilters = () => {
    setProvinciaId(null);
    setCircunscripcionId(null);
    setMunicipioId(null);
    setDistritoId(null);
    setLocalidadId(null);
  };

  const handleExportExcel = async () => {
    if (!procesoId) return;
    
    setIsExporting(true);
    try {
      const response = await api.post(
        "/reportes/file/csv/recintos",
        {
          procesoId: procesoId,
          provinciaId: provinciaId || 0,
          circunscripcionId: circunscripcionId || 0,
          municipioId: municipioId || 0,
          distritoId: distritoId || 0,
          localidadId: localidadId || 0,
          incluirVacios: incluirVacios,
        },
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_recintos_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = provinciaId || circunscripcionId || municipioId || distritoId || localidadId;

  const filteredRecintos = useMemo(() => {
    if (!reporte?.data) return [];
    if (!searchTerm) return reporte.data;
    return reporte.data.filter((recinto) =>
      recinto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reporte?.data, searchTerm]);

  if (!procesoId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Selecciona un proceso para ver el reporte</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
        <p className="text-lg text-muted-foreground">Cargando reporte...</p>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Error al cargar el reporte</p>
      </div>
    );
  }

  const { resumen } = reporte;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground">
              Resumen de cobertura de recintos y mesas
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select
              value={provinciaId?.toString() || "all"}
              onValueChange={(val) => setProvinciaId(val === "all" ? null : Number(val))}
              disabled={isLoadingListas}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Provincias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Provincias</SelectItem>
                {provincias.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={circunscripcionId?.toString() || "all"}
              onValueChange={(val) => setCircunscripcionId(val === "all" ? null : Number(val))}
              disabled={isLoadingListas}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Circunscripciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Circunscripciones</SelectItem>
                {circunscripciones.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    Circunscripción {c.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={municipioId?.toString() || "all"}
              onValueChange={(val) => setMunicipioId(val === "all" ? null : Number(val))}
              disabled={isLoadingListas}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Municipios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Municipios</SelectItem>
                {municipios.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={distritoId?.toString() || "all"}
              onValueChange={(val) => setDistritoId(val === "all" ? null : Number(val))}
              disabled={isLoadingListas}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Distritos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Distritos</SelectItem>
                {distritosMunicipales.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-[180px]">
              <ReactSelect
                options={localidadOptions}
                value={selectedFilterLocalidad}
                onChange={(option: any) => {
                  setLocalidadId(option?.value || null);
                }}
                placeholder="Localidades..."
                isClearable
                isSearchable
                classNames={selectClassNames}
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="incluirVacios"
              checked={incluirVacios}
              onCheckedChange={(checked) => setIncluirVacios(checked as boolean)}
            />
            <label
              htmlFor="incluirVacios"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir vacíos
            </label>
          </div>

          <Button
            onClick={handleExportExcel}
            disabled={isExporting || !procesoId}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar recintos informe
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recintos
            </CardTitle>
            <Building2 className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resumen.recintos.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recintos registrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Jefe de Recinto
            </CardTitle>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {resumen.recintos.conJefe.valor}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={resumen.recintos.conJefe.porcentaje} className="h-2" />
              <span className="text-sm font-medium">{resumen.recintos.conJefe.porcentaje}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Jefe de Recinto
            </CardTitle>
            <UserX className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {resumen.recintos.sinJefe.valor}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={resumen.recintos.sinJefe.porcentaje} className="h-2 [&>div]:bg-red-500" />
              <span className="text-sm font-medium">{resumen.recintos.sinJefe.porcentaje}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobertura de Mesas
            </CardTitle>
            <LayoutGrid className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {resumen.mesas.cobertura.valor}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={resumen.mesas.cobertura.porcentaje} className="h-2 [&>div]:bg-amber-500" />
              <span className="text-sm font-medium">{resumen.mesas.cobertura.porcentaje}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Delegados Reserva</CardTitle>
            <p className="text-sm text-muted-foreground">Personal de reserva disponible</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-600">{resumen.reservas}</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Detalle por Recinto</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredRecintos.length} de {reporte.totalRecintos} recintos
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recinto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-[40%]">Recinto</TableHead>
                    <TableHead className="text-center">Jefe</TableHead>
                    <TableHead className="text-center">Mesas</TableHead>
                    <TableHead className="text-center">Cobertura</TableHead>
                    <TableHead className="text-center">Reservas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecintos.length > 0 ? (
                    filteredRecintos.map((recinto) => {
                      const coberturaPorcentaje = recinto.mesasTotal > 0
                        ? Math.round((recinto.mesasConDelegado / recinto.mesasTotal) * 100)
                        : 0;

                      return (
                        <TableRow key={recinto.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate" title={recinto.nombre}>
                                {recinto.nombre}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {recinto.jefe ? (
                              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Si
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">
                              {recinto.mesasConDelegado}/{recinto.mesasTotal}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress
                                value={coberturaPorcentaje}
                                className="h-2 w-16 [&>div]:bg-sky-500"
                              />
                              <span className="text-sm w-10">{coberturaPorcentaje}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {recinto.reservas > 0 ? (
                              <Badge variant="outline" className="border-orange-300 text-orange-700">
                                {recinto.reservas}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron recintos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}