"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X, Search, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { useProcess } from "@/lib/context/process-context";
import {
  useListasGeograficas,
  useRecintos,
  useAsignarAlcances,
  useUsuarioAlcances,
  useEliminarAlcance,
} from "@/lib/hooks/useAlcances";
import { useGruposRecinto } from "@/lib/hooks/useGruposRecinto";
import type { Usuario } from "@/lib/types/usuario";
import type {
  NivelAlcance,
  AlcanceItem,
  UsuarioAlcance,
} from "@/lib/types/alcance";
import { NIVEL_ALCANCE_LABELS } from "@/lib/types/alcance";
import { GruposRecintoModal } from "./grupos-recinto-modal";

interface PermisosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

const NIVELES_ALCANCE: NivelAlcance[] = [
  "pais",
  "departamento",
  "provincia",
  "municipio",
  "distrito_municipal",
  "localidad",
  "circunscripcion",
  "recinto",
  "grupo_recinto",
];

export function PermisosModal({
  open,
  onOpenChange,
  usuario,
}: PermisosModalProps) {
  const { procesoId } = useProcess();
  const [selectedNivel, setSelectedNivel] = useState<NivelAlcance | "">("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [alcances, setAlcances] = useState<AlcanceItem[]>([]);
  const [recintoSearch, setRecintoSearch] = useState("");
  const [recintoSelectOpen, setRecintoSelectOpen] = useState(false);
  const [showGruposModal, setShowGruposModal] = useState(false);

  const {
    paises,
    departamentos,
    provincias,
    municipios,
    distritosMunicipales,
    localidades,
    circunscripciones,
    isLoading: isLoadingListas,
  } = useListasGeograficas(open);

  const shouldSearchRecintos = recintoSearch.length >= 3;
  const { data: recintosData, isLoading: isLoadingRecintos } = useRecintos(
    recintoSearch,
    open && selectedNivel === "recinto" && shouldSearchRecintos,
  );

  const { data: gruposRecinto, isLoading: isLoadingGrupos } = useGruposRecinto(
    procesoId || undefined,
    open && selectedNivel === "grupo_recinto"
  );

  useEffect(() => {
    if (
      shouldSearchRecintos &&
      recintosData?.data &&
      recintosData.data.length > 0 &&
      !isLoadingRecintos
    ) {
      setRecintoSelectOpen(true);
    }
  }, [recintosData, shouldSearchRecintos, isLoadingRecintos]);

  const { data: permisosExistentes, isLoading: isLoadingPermisos } =
    useUsuarioAlcances(usuario?.id ?? null, procesoId, open);

  const asignarMutation = useAsignarAlcances();
  const eliminarMutation = useEliminarAlcance();

  const currentList = useMemo(() => {
    switch (selectedNivel) {
      case "pais":
        return paises.map((p) => ({ id: p.id, nombre: p.nombre }));
      case "departamento":
        return departamentos.map((d) => ({ id: d.id, nombre: d.nombre }));
      case "provincia":
        return provincias.map((p) => ({ id: p.id, nombre: p.nombre }));
      case "municipio":
        return municipios.map((m) => ({ id: m.id, nombre: m.nombre }));
      case "distrito_municipal":
        return distritosMunicipales.map((d) => ({
          id: d.id,
          nombre: `${d.nombre} - ${d.municipio.nombre}`,
        }));
      case "localidad":
        return localidades.map((l) => ({ id: l.id, nombre: l.nombre }));
      case "circunscripcion":
        return circunscripciones.map((c) => ({
          id: c.id,
          nombre: `Circunscripción ${c.numero}`,
        }));
      case "recinto":
        return (
          recintosData?.data?.map((r) => ({ id: r.id, nombre: r.nombre })) || []
        );
      case "grupo_recinto":
        return (
          gruposRecinto?.map((g) => ({ id: g.id, nombre: g.nombre })) || []
        );
      default:
        return [];
    }
  }, [
    selectedNivel,
    paises,
    departamentos,
    provincias,
    municipios,
    distritosMunicipales,
    localidades,
    circunscripciones,
    recintosData,
    gruposRecinto,
  ]);

  const getAlcanceLabel = (alcance: AlcanceItem): string => {
    const nivel = NIVEL_ALCANCE_LABELS[alcance.nivelAlcance];
    let itemName = "";

    switch (alcance.nivelAlcance) {
      case "pais":
        itemName = paises.find((p) => p.id === alcance.paisId)?.nombre || "";
        break;
      case "departamento":
        itemName =
          departamentos.find((d) => d.id === alcance.departamentoId)?.nombre ||
          "";
        break;
      case "provincia":
        itemName =
          provincias.find((p) => p.id === alcance.provinciaId)?.nombre || "";
        break;
      case "municipio":
        itemName =
          municipios.find((m) => m.id === alcance.municipioId)?.nombre || "";
        break;
      case "distrito_municipal":
        const distrito = distritosMunicipales.find(
          (d) => d.id === alcance.distritoMunicipalId,
        );
        itemName = distrito
          ? `${distrito.nombre} - ${distrito.municipio.nombre}`
          : "";
        break;
      case "localidad":
        itemName =
          localidades.find((l) => l.id === alcance.localidadId)?.nombre || "";
        break;
      case "circunscripcion":
        const circ = circunscripciones.find(
          (c) => c.id === alcance.circunscripcionId,
        );
        itemName = circ ? `Circ. ${circ.numero}` : "";
        break;
      case "recinto":
        itemName =
          recintosData?.data?.find((r) => r.id === alcance.recintoId)?.nombre ||
          `Recinto ${alcance.recintoId}`;
        break;
      case "grupo_recinto":
        itemName =
          gruposRecinto?.find((g) => g.id === alcance.grupoRecintoId)?.nombre ||
          `Grupo ${alcance.grupoRecintoId}`;
        break;
      default:
        itemName = "Desconocido";
    }

    return `${nivel}: ${itemName}`;
  };

  const getPermisoExistenteLabel = (permiso: UsuarioAlcance): string => {
    const nivel = NIVEL_ALCANCE_LABELS[permiso.nivelAlcance];
    let itemName = "";

    switch (permiso.nivelAlcance) {
      case "pais":
        itemName = permiso.pais?.nombre || "";
        break;
      case "departamento":
        itemName = permiso.departamento?.nombre || "";
        break;
      case "provincia":
        itemName = permiso.provincia?.nombre || "";
        break;
      case "municipio":
        itemName = permiso.municipio?.nombre || "";
        break;
      case "distrito_municipal":
        itemName = permiso.distritoMunicipal?.nombre || "";
        break;
      case "localidad":
        itemName = permiso.localidad?.nombre || "";
        break;
      case "circunscripcion":
        itemName = permiso.circunscripcion
          ? `Circ. ${permiso.circunscripcion.numero}`
          : "";
        break;
      case "recinto":
        itemName = permiso.recinto?.nombre || "";
        break;
      case "grupo_recinto":
        itemName = permiso.grupoRecinto?.nombre || "";
        break;
      default:
        itemName = "Desconocido";
    }

    return `${nivel}: ${itemName}`;
  };

  const handleAddAlcance = () => {
    if (!selectedNivel || !selectedItemId) {
      toast.error("Selecciona un nivel y un item");
      return;
    }

    const itemId = parseInt(selectedItemId);

    const newAlcance: AlcanceItem = {
      nivelAlcance: selectedNivel,
    };

    switch (selectedNivel) {
      case "pais":
        newAlcance.paisId = itemId;
        break;
      case "departamento":
        newAlcance.departamentoId = itemId;
        break;
      case "provincia":
        newAlcance.provinciaId = itemId;
        break;
      case "municipio":
        newAlcance.municipioId = itemId;
        break;
      case "distrito_municipal":
        newAlcance.distritoMunicipalId = itemId;
        break;
      case "localidad":
        newAlcance.localidadId = itemId;
        break;
      case "circunscripcion":
        newAlcance.circunscripcionId = itemId;
        break;
      case "recinto":
        newAlcance.recintoId = itemId;
        break;
      case "grupo_recinto":
        newAlcance.grupoRecintoId = itemId;
        break;
    }

    const existsInNew = alcances.some((a) => {
      if (a.nivelAlcance !== selectedNivel) return false;
      switch (selectedNivel) {
        case "pais":
          return a.paisId === itemId;
        case "departamento":
          return a.departamentoId === itemId;
        case "provincia":
          return a.provinciaId === itemId;
        case "municipio":
          return a.municipioId === itemId;
        case "distrito_municipal":
          return a.distritoMunicipalId === itemId;
        case "localidad":
          return a.localidadId === itemId;
        case "circunscripcion":
          return a.circunscripcionId === itemId;
        case "recinto":
          return a.recintoId === itemId;
        case "grupo_recinto":
          return a.grupoRecintoId === itemId;
        default:
          return false;
      }
    });

    const existsInExisting = permisosExistentes?.some((p) => {
      if (p.nivelAlcance !== selectedNivel) return false;
      switch (selectedNivel) {
        case "pais":
          return p.paisId === itemId;
        case "departamento":
          return p.departamentoId === itemId;
        case "provincia":
          return p.provinciaId === itemId;
        case "municipio":
          return p.municipioId === itemId;
        case "distrito_municipal":
          return p.distritoMunicipalId === itemId;
        case "localidad":
          return p.localidadId === itemId;
        case "circunscripcion":
          return p.circunscripcionId === itemId;
        case "recinto":
          return p.recintoId === itemId;
        case "grupo_recinto":
          return p.grupoRecintoId === itemId;
        default:
          return false;
      }
    });

    if (existsInNew || existsInExisting) {
      toast.error("Este alcance ya existe");
      return;
    }

    setAlcances([...alcances, newAlcance]);
    setSelectedItemId("");
  };

  const handleRemoveAlcance = (index: number) => {
    setAlcances(alcances.filter((_, i) => i !== index));
  };

  const handleEliminarPermisoExistente = async (id: number) => {
    try {
      await eliminarMutation.mutateAsync(id);
      toast.success("Permiso eliminado exitosamente");
    } catch {
      toast.error("Error al eliminar permiso");
    }
  };

  const handleSubmit = async () => {
    if (!usuario || !procesoId) {
      toast.error("Error: Usuario o proceso no seleccionado");
      return;
    }

    if (alcances.length === 0) {
      toast.error("Agrega al menos un alcance");
      return;
    }

    try {
      await asignarMutation.mutateAsync({
        usuarioId: usuario.id,
        procesoId: procesoId,
        alcances: alcances,
      });
      toast.success("Permisos asignados exitosamente");
      setAlcances([]);
    } catch {
      toast.error("Error al asignar permisos");
    }
  };

  const handleClose = () => {
    setSelectedNivel("");
    setSelectedItemId("");
    setAlcances([]);
    setRecintoSearch("");
    onOpenChange(false);
  };

  const isLoading = isLoadingListas || isLoadingPermisos;

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle>Asignar Permisos</DialogTitle>
          <DialogDescription>
            Asigna permisos geográficos a {usuario?.nombres}{" "}
            {usuario?.apellidos}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel de Alcance</Label>
                  <Select
                    value={selectedNivel}
                    onValueChange={(value: NivelAlcance) => {
                      setSelectedNivel(value);
                      setSelectedItemId("");
                      setRecintoSearch("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVELES_ALCANCE.map((nivel) => (
                        <SelectItem key={nivel} value={nivel}>
                          {NIVEL_ALCANCE_LABELS[nivel]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {selectedNivel
                      ? NIVEL_ALCANCE_LABELS[selectedNivel]
                      : "Selecciona un nivel primero"}
                  </Label>

                  {selectedNivel === "grupo_recinto" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={selectedItemId}
                          onValueChange={setSelectedItemId}
                          disabled={isLoadingGrupos}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue
                              placeholder={
                                isLoadingGrupos
                                  ? "Cargando grupos..."
                                  : "Seleccionar grupo..."
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {currentList.length > 0 ? (
                              currentList.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {item.nombre}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-muted-foreground">
                                No hay grupos creados
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowGruposModal(true)}
                          title="Gestionar Grupos de Recinto"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      {currentList.length === 0 && !isLoadingGrupos && (
                        <p className="text-xs text-muted-foreground">
                          No hay grupos creados.{" "}
                          <button
                            type="button"
                            className="text-sky-600 hover:underline"
                            onClick={() => setShowGruposModal(true)}
                          >
                            Crear uno nuevo
                          </button>
                        </p>
                      )}
                    </div>
                  ) : selectedNivel === "recinto" ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar recinto (min. 3 letras)..."
                          value={recintoSearch}
                          onChange={(e) => {
                            setRecintoSearch(e.target.value);
                            if (e.target.value.length < 3) {
                              setRecintoSelectOpen(false);
                            }
                          }}
                          className="pl-8"
                        />
                      </div>
                      {recintoSearch.length > 0 && recintoSearch.length < 3 && (
                        <p className="text-xs text-muted-foreground">
                          Escribe {3 - recintoSearch.length} letra(s) más para
                          buscar...
                        </p>
                      )}
                      <Select
                        value={selectedItemId}
                        onValueChange={(value) => {
                          setSelectedItemId(value);
                          setRecintoSelectOpen(false);
                        }}
                        open={recintoSelectOpen}
                        onOpenChange={setRecintoSelectOpen}
                        disabled={!shouldSearchRecintos || isLoadingRecintos}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingRecintos
                                ? "Buscando..."
                                : !shouldSearchRecintos
                                  ? "Escribe para buscar..."
                                  : "Seleccionar recinto..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {currentList.length > 0 ? (
                            currentList.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nombre}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="py-2 px-3 text-sm text-muted-foreground">
                              No se encontraron resultados
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Select
                      value={selectedItemId}
                      onValueChange={setSelectedItemId}
                      disabled={!selectedNivel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <Button
                onClick={handleAddAlcance}
                disabled={!selectedNivel || !selectedItemId}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Alcance
              </Button>

              {alcances.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-green-600">
                    Por agregar ({alcances.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 max-h-[150px] overflow-y-auto">
                    {alcances.map((alcance, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      >
                        {getAlcanceLabel(alcance)}
                        <button
                          type="button"
                          onClick={() => handleRemoveAlcance(index)}
                          className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {alcances.length > 0 && (
                <Button
                  onClick={handleSubmit}
                  disabled={asignarMutation.isPending}
                  className="w-full"
                >
                  {asignarMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Guardar {alcances.length} nuevo(s) permiso(s)
                    </>
                  )}
                </Button>
              )}

              <div className="border-t pt-2">
                <Label className="text-lg font-semibold">
                  Permisos Actuales
                </Label>
              </div>

              <div className="space-y-2">
                {permisosExistentes && permisosExistentes.length > 0 ? (
                  <>
                    <Label className="text-muted-foreground">
                      {permisosExistentes.length} permiso(s) asignado(s)
                    </Label>
                    <div className="border rounded-lg bg-muted/50 max-h-[250px] overflow-y-auto">
                      <div className="flex flex-wrap gap-2 p-3">
                        {permisosExistentes.map((permiso) => (
                          <Badge
                            key={permiso.id}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1.5 text-sm"
                          >
                            <span className="text-xs text-muted-foreground mr-1">
                              #{permiso.id}
                            </span>
                            {getPermisoExistenteLabel(permiso)}
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminarPermisoExistente(permiso.id)
                              }
                              disabled={eliminarMutation.isPending}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 text-destructive"
                            >
                              {eliminarMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
                    No hay permisos asignados para este usuario
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>

    <GruposRecintoModal
      open={showGruposModal}
      onOpenChange={setShowGruposModal}
    />
    </>
  );
}
