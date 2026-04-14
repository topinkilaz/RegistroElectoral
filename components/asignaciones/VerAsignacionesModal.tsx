"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, UserCog, Trash2, Loader2, Users, CreditCard, Pencil, ArrowRight, MoreHorizontal, UserCheck, Repeat } from "lucide-react";
import { toast } from "sonner";
import { useEliminarJefeRecinto, useRegistrarJefeRecinto, useActualizarJefeRecinto, useConvertirJefeADelegado } from "@/lib/hooks/useJefeRecinto";
import { useEliminarDelegadoMesa, useActualizarDelegadoMesa, useConvertirDelegadoAJefe } from "@/lib/hooks/useDelegadoMesa";
import { useProcess } from "@/lib/context/process-context";
import { AgregarJefeModal, AgregarDelegadoModal, AgregarReservaModal } from "./modals";
import type { Recinto, Mesa, JefeRecinto, DelegadoReserva } from "@/lib/types/recinto";
import WhatsAppIcon from "../whatsapp-icon";
import { ConfirmDialog } from "./modals/confirm-dialog";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";

interface VerAsignacionesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recinto: Recinto | null;
}

function getNombreCompleto(persona: { usuario?: { nombres?: string; apellidos?: string }; nombres?: string; apellidos?: string } | null): string {
  if (!persona) return "";
  if (persona.usuario) {
    return `${persona.usuario.nombres || ""} ${persona.usuario.apellidos || ""}`.trim();
  }
  if (persona.nombres && persona.apellidos) {
    return `${persona.nombres} ${persona.apellidos}`.trim();
  }
  return "";
}

function getIniciales(nombre: string): string {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getMesasDisponibles(mesas: Mesa[]): Mesa[] {
  return mesas.filter(mesa => {
    const tieneTitular = (mesa.delegadosMesa || []).some((d: any) => d.tipo === "titular");
    return !tieneTitular;
  });
}

function tieneJefe(jefes: JefeRecinto[]): boolean {
  return jefes && jefes.length > 0;
}

function JefeSection({
  jefes,
  mesasDisponibles,
  onAgregar,
  onEditar,
  onConvertirADelegado,
}: {
  jefes: JefeRecinto[];
  mesasDisponibles: Mesa[];
  onAgregar: () => void;
  onEditar: (jefe: JefeRecinto) => void;
  onConvertirADelegado: (jefe: JefeRecinto, mesaId?: number, tipo?: string) => void;
}) {
  const eliminarMutation = useEliminarJefeRecinto();
  const actualizarJefeMutation = useActualizarJefeRecinto();
  const convertirAJefeMutation = useConvertirJefeADelegado();
  const jefe = jefes?.find(j => j.tipo === "titular") || jefes?.[0];
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedMesaId, setSelectedMesaId] = useState<string>("");
  const [convertTipo, setConvertTipo] = useState<"titular" | "reserva">("titular");
 const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);
  const [updatingCarnet, setUpdatingCarnet] = useState(false);
    const handleUpdateWhatsapp = async (checked: boolean) => {
    if (!jefe) return;
    setUpdatingWhatsapp(true);
    try {
      await actualizarJefeMutation.mutateAsync({ 
        id: jefe.id, 
        data: { enGrupoWhatsapp: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingWhatsapp(false);
    }
  };

  const handleUpdateCarnet = async (checked: boolean) => {
    if (!jefe) return;
    setUpdatingCarnet(true);
    try {
      await actualizarJefeMutation.mutateAsync({ 
        id: jefe.id, 
        data: { tieneFotocopiaCarnet: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingCarnet(false);
    }
  };
  const handleEliminar = async () => {
    if (!jefe?.id) return;
    try {
      await eliminarMutation.mutateAsync(jefe.id);
      toast.success("Jefe eliminado");
      setShowConfirm(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar jefe");
    }
  };

  const handleConvertir = async () => {
    if (!jefe?.id) return;
    try {
      await convertirAJefeMutation.mutateAsync({
        id: jefe.id,
        data: {
          tipo: convertTipo,
          mesaId: convertTipo === "titular" && selectedMesaId ? parseInt(selectedMesaId) : undefined,
          enGrupoWhatsapp: jefe.enGrupoWhatsapp,
          tieneFotocopiaCarnet: jefe.tieneFotocopiaCarnet,
          agrupacionId: jefe.agrupacionId || undefined,
        },
      });
      toast.success(convertTipo === "titular" ? "Jefe convertido a delegado de mesa" : "Jefe convertido a reserva");
      setShowConvertDialog(false);
      setSelectedMesaId("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al convertir");
    }
  };

  if (jefe) {
    const nombre = getNombreCompleto(jefe);
    const celular = jefe.usuario?.celular;
    const documento = jefe.usuario?.numDocumento;
    const agrupacion = jefe.agrupacion;
    const whatsappNumber = celular?.replace(/\D/g, "");

    return (
      <>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sm font-semibold text-sky-700 dark:text-sky-400 shrink-0">
              {getIniciales(nombre)}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-semibold leading-none dark:text-gray-100">{nombre}</p>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-0 text-xs">
                  {jefe.tipo === "titular" ? "Titular" : "Reserva"}
                </Badge>
                {agrupacion && (
                  <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                    {agrupacion.sigla}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {documento && (
                  <span className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="font-mono">CI: {documento}</span>
                  </span>
                )}
                {celular && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>{celular}</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            {updatingWhatsapp ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={jefe.enGrupoWhatsapp || false}
                onCheckedChange={handleUpdateWhatsapp}
                disabled={actualizarJefeMutation.isPending}
              />
            )}
            <span className="text-sm text-muted-foreground">Grupo WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            {updatingCarnet ? (
              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={jefe.tieneFotocopiaCarnet || false}
                onCheckedChange={handleUpdateCarnet}
                disabled={actualizarJefeMutation.isPending}
              />
            )}
            <span className="text-sm text-muted-foreground">Fotocopia CI</span>
          </div>
        </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditar(jefe)}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConvertDialog(true)}
              className="text-amber-600 dark:text-amber-400"
            >
              <Repeat className="h-4 w-4 mr-1" />
              Convertir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={eliminarMutation.isPending}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              {eliminarMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </div>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onConfirm={handleEliminar}
          title="¿Eliminar jefe de recinto?"
          description="Esta acción no se puede deshacer. El jefe será removido del recinto."
          isLoading={eliminarMutation.isPending}
        />

        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Convertir Jefe a Delegado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Tipo de destino</Label>
                <Select value={convertTipo} onValueChange={(v: any) => setConvertTipo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="titular">Delegado de Mesa</SelectItem>
                    <SelectItem value="reserva">Delegado Reserva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {convertTipo === "titular" && (
                <div className="space-y-2">
                  <Label>Seleccionar Mesa</Label>
                  <Select value={selectedMesaId} onValueChange={setSelectedMesaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mesa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mesasDisponibles.map((mesa) => (
                        <SelectItem key={mesa.id} value={mesa.id.toString()}>
                          Mesa {mesa.numero} ({mesa.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConvertir} disabled={convertirAJefeMutation.isPending || (convertTipo === "titular" && !selectedMesaId)}>
                  {convertirAJefeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Convertir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-muted-foreground dark:text-gray-400">
        <div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
          <UserCog className="h-6 w-6" />
        </div>
        <span className="text-sm">Sin jefe asignado</span>
      </div>
      <Button
        size="sm"
        onClick={onAgregar}
        className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600"
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        Asignar jefe
      </Button>
    </div>
  );
}

interface DelegadoMesaData {
  id: number;
  tipo: string;
  estado?: string;
  enGrupoWhatsapp?: boolean;
  tieneFotocopiaCarnet?: boolean;
  agrupacionId?: number | null;
  agrupacion?: { id: number; nombre: string; sigla: string } | null;
  usuario?: {
    id: number;
    nombres: string;
    apellidos: string;
    numDocumento: string;
    celular: string;
  };
}

function DelegadoCell({
  mesa,
  onAgregar,
  onEditar,
  onMoverAReserva,
  onConvertirAJefe,
}: {
  mesa: Mesa;
  onAgregar: () => void;
  onEditar: (delegado: DelegadoMesaData, mesa: Mesa) => void;
  onMoverAReserva: (delegado: DelegadoMesaData) => void;
  onConvertirAJefe: (delegado: DelegadoMesaData) => void;
}) {
  const eliminarMutation = useEliminarDelegadoMesa();
  const actualizarDelegadoMutation = useActualizarDelegadoMesa();
  const [showConfirm, setShowConfirm] = useState(false);
  const [delegadoId, setDelegadoId] = useState<number | null>(null);
   const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false);
  const [updatingCarnet, setUpdatingCarnet] = useState(false);
 const handleUpdateWhatsapp = async (checked: boolean) => {
    if (!titular) return;
    setUpdatingWhatsapp(true);
    try {
      await actualizarDelegadoMutation.mutateAsync({ 
        id: titular.id, 
        data: { enGrupoWhatsapp: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingWhatsapp(false);
    }
  };

  const handleUpdateCarnet = async (checked: boolean) => {
    if (!titular) return;
    setUpdatingCarnet(true);
    try {
      await actualizarDelegadoMutation.mutateAsync({ 
        id: titular.id, 
        data: { tieneFotocopiaCarnet: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingCarnet(false);
    }
  };
  const handleEliminar = async () => {
    if (!delegadoId) return;
    try {
      await eliminarMutation.mutateAsync(delegadoId);
      toast.success("Delegado eliminado");
      setShowConfirm(false);
      setDelegadoId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar delegado");
    }
  };

  const titular = (mesa.delegadosMesa || []).find((d: any) => d.tipo === "titular");

  if (titular) {
    const nombre = getNombreCompleto(titular);
    const celular = titular.usuario?.celular || titular.celular;
    const documento = titular.usuario?.numDocumento || titular.numDocumento;
    const agrupacion = titular.agrupacion;
    const whatsappNumber = celular?.replace(/\D/g, "");

    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-xs font-semibold text-sky-700 dark:text-sky-400 shrink-0">
                {getIniciales(nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold leading-none truncate dark:text-gray-100">{nombre}</p>
                  {agrupacion && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 dark:border-gray-600 dark:text-gray-300">
                      {agrupacion.sigla}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditar(titular, mesa)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onConvertirAJefe(titular)}>
                    <UserCheck className="h-3.5 w-3.5 mr-2" />
                    Convertir a Jefe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMoverAReserva(titular)}>
                    <ArrowRight className="h-3.5 w-3.5 mr-2" />
                    Mover a Reserva
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => {
                      setDelegadoId(titular.id);
                      setShowConfirm(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground dark:text-gray-400 pl-10">
            {documento && (
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span>CI: {documento}</span>
              </span>
            )}
            {celular && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <WhatsAppIcon className="h-3 w-3" />
                <span>{celular}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 pl-10 mt-1">
            <div className="flex items-center gap-2">
            {updatingWhatsapp ? (
              <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={titular.enGrupoWhatsapp || false}
                onCheckedChange={handleUpdateWhatsapp}
              />
            )}
            <span className="text-xs text-muted-foreground">WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            {updatingCarnet ? (
              <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={titular.tieneFotocopiaCarnet || false}
                onCheckedChange={handleUpdateCarnet}
              />
            )}
            <span className="text-xs text-muted-foreground">Fotocopia CI</span>
          </div>
        
          </div>
        </div>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onConfirm={handleEliminar}
          title="¿Eliminar delegado?"
          description="Esta acción no se puede deshacer. El delegado será removido de la mesa."
          isLoading={eliminarMutation.isPending}
        />
      </>
    );
  }

  return (
    <div className="flex items-center justify-center py-2">
      <Button
        size="sm"
        onClick={onAgregar}
        className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 h-7 px-3 text-xs"
      >
        <UserPlus className="h-3 w-3 mr-1.5" />
        Asignar delegado
      </Button>
    </div>
  );
}

function ReservasSection({
  delegadosReserva,
  mesasDisponibles,
  hayJefe,
  onAgregar,
  onEditar,
  onMoverAJefe,
  onMoverAMesa,
  onConvertirAJefe,
}: {
  delegadosReserva: DelegadoReserva[];
  mesasDisponibles: Mesa[];
  hayJefe: boolean;
  onAgregar: () => void;
  onEditar: (delegado: DelegadoReserva) => void;
  onMoverAJefe: (delegado: DelegadoReserva) => void;
  onMoverAMesa: (delegado: DelegadoReserva, mesa: Mesa) => void;
  onConvertirAJefe: (delegado: DelegadoReserva) => void;
}) {
  const eliminarMutation = useEliminarDelegadoMesa();
  const actualizarDelegadoMutation = useActualizarDelegadoMesa();
  const [showConfirm, setShowConfirm] = useState(false);
  const [delegadoId, setDelegadoId] = useState<number | null>(null);
 const [updatingStates, setUpdatingStates] = useState<Record<number, { whatsapp: boolean; carnet: boolean }>>({});
  const handleUpdateWhatsapp = async (delegadoId: number, checked: boolean) => {
    setUpdatingStates(prev => ({
      ...prev,
      [delegadoId]: { ...prev[delegadoId], whatsapp: true }
    }));
    try {
      await actualizarDelegadoMutation.mutateAsync({ 
        id: delegadoId, 
        data: { enGrupoWhatsapp: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingStates(prev => ({
        ...prev,
        [delegadoId]: { ...prev[delegadoId], whatsapp: false }
      }));
    }
  };

  const handleUpdateCarnet = async (delegadoId: number, checked: boolean) => {
    setUpdatingStates(prev => ({
      ...prev,
      [delegadoId]: { ...prev[delegadoId], carnet: true }
    }));
    try {
      await actualizarDelegadoMutation.mutateAsync({ 
        id: delegadoId, 
        data: { tieneFotocopiaCarnet: checked } 
      });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingStates(prev => ({
        ...prev,
        [delegadoId]: { ...prev[delegadoId], carnet: false }
      }));
    }
  };

  const handleEliminar = async () => {
    if (!delegadoId) return;
    try {
      await eliminarMutation.mutateAsync(delegadoId);
      toast.success("Delegado reserva eliminado");
      setShowConfirm(false);
      setDelegadoId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar");
    }
  };

  const reservas = delegadosReserva || [];

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase flex items-center gap-2">
          <Users className="h-4 w-4" />
          Delegados Reserva ({reservas.length})
        </h3>
        <Button
          size="sm"
          onClick={onAgregar}
          className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 h-7 text-xs"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Agregar
        </Button>
      </div>

      {reservas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reservas.map((delegado) => {
              const isLoadingWhatsapp = updatingStates[delegado.id]?.whatsapp || false;
    const isLoadingCarnet = updatingStates[delegado.id]?.carnet || false;
            const nombre = getNombreCompleto(delegado);
            const celular = delegado.usuario?.celular;
            const documento = delegado.usuario?.numDocumento;
            const agrupacion = delegado.agrupacion;
            const whatsappNumber = celular?.replace(/\D/g, "");

            return (
              <div
                key={delegado.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-900/50 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-semibold text-orange-700 dark:text-orange-400 shrink-0">
                      {getIniciales(nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold truncate dark:text-gray-100">{nombre}</p>
                        {agrupacion && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 dark:border-gray-600 dark:text-gray-300">
                            {agrupacion.sigla}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => onEditar(delegado)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onConvertirAJefe(delegado)}>
                        <UserCheck className="h-3.5 w-3.5 mr-2" />
                        Convertir a Jefe
                      </DropdownMenuItem>
                      {!hayJefe && (
                        <DropdownMenuItem onClick={() => onMoverAJefe(delegado)}>
                          <UserCheck className="h-3.5 w-3.5 mr-2" />
                          Asignar como Jefe (Registrar)
                        </DropdownMenuItem>
                      )}
                      {mesasDisponibles.length > 0 ? (
                        <>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Asignar a Mesa
                          </div>
                          {mesasDisponibles.map((mesa) => (
                            <DropdownMenuItem
                              key={mesa.id}
                              onClick={() => onMoverAMesa(delegado, mesa)}
                            >
                              <ArrowRight className="h-3.5 w-3.5 mr-2" />
                              Mesa {mesa.numero}
                            </DropdownMenuItem>
                          ))}
                        </>
                      ) : (
                        <>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                            Sin mesas disponibles
                          </div>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => {
                          setDelegadoId(delegado.id);
                          setShowConfirm(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground dark:text-gray-400 pl-11">
                  {documento && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span>CI: {documento}</span>
                    </span>
                  )}
                  {celular && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      <WhatsAppIcon className="h-3 w-3" />
                      <span>{celular}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 pl-11 mt-1">
                    <div className="flex items-center gap-2">
            {isLoadingWhatsapp ? (
              <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={delegado.enGrupoWhatsapp || false}
                onCheckedChange={(checked) => handleUpdateWhatsapp(delegado.id, checked)}
              />
            )}
            <span className="text-xs text-muted-foreground">WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingCarnet ? (
              <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
            ) : (
              <Switch
                checked={delegado.tieneFotocopiaCarnet || false}
                onCheckedChange={(checked) => handleUpdateCarnet(delegado.id, checked)}
              />
            )}
            <span className="text-xs text-muted-foreground">Fotocopia CI</span>
          </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground dark:text-gray-400 text-center py-6">
          No hay delegados reserva registrados
        </p>
      )}

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleEliminar}
        title="¿Eliminar delegado reserva?"
        description="Esta acción no se puede deshacer. El delegado será removido de la lista de reservas."
        isLoading={eliminarMutation.isPending}
      />
    </>
  );
}

export function VerAsignacionesModal({
  open,
  onOpenChange,
  recinto,
}: VerAsignacionesModalProps) {
  const { procesoId } = useProcess();
  const [showAgregarJefe, setShowAgregarJefe] = useState(false);
  const [showAgregarDelegado, setShowAgregarDelegado] = useState(false);
  const [showAgregarReserva, setShowAgregarReserva] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  const [editJefeData, setEditJefeData] = useState<JefeRecinto | null>(null);
  const [editDelegadoData, setEditDelegadoData] = useState<DelegadoMesaData | null>(null);
  const [editReservaData, setEditReservaData] = useState<DelegadoReserva | null>(null);

  const registrarJefeMutation = useRegistrarJefeRecinto();
  const actualizarDelegadoMutation = useActualizarDelegadoMesa();
  const eliminarDelegadoMutation = useEliminarDelegadoMesa();
  const actualizarJefeMutation = useActualizarJefeRecinto();
  const convertirJefeADelegadoMutation = useConvertirJefeADelegado();
  const convertirDelegadoAJefeMutation = useConvertirDelegadoAJefe();

  if (!recinto) return null;

  const mesasDisponibles = getMesasDisponibles(recinto.mesas || []);
  const hayJefe = tieneJefe(recinto.jefes || []);

  const handleAgregarDelegado = (mesa: Mesa) => {
    setSelectedMesa(mesa);
    setEditDelegadoData(null);
    setShowAgregarDelegado(true);
  };

  const handleEditarJefe = (jefe: JefeRecinto) => {
    setEditJefeData(jefe);
    setShowAgregarJefe(true);
  };

  const handleEditarDelegado = (delegado: DelegadoMesaData, mesa: Mesa) => {
    setSelectedMesa(mesa);
    setEditDelegadoData(delegado);
    setShowAgregarDelegado(true);
  };

  const handleEditarReserva = (delegado: DelegadoReserva) => {
    setEditReservaData(delegado);
    setShowAgregarReserva(true);
  };

  const handleMoverDelegadoAReserva = async (delegado: DelegadoMesaData) => {
    try {
      await actualizarDelegadoMutation.mutateAsync({
        id: delegado.id,
        data: {
          tipo: "reserva",
          mesaId: null,
        },
      });
      toast.success("Delegado movido a reserva");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al mover delegado");
    }
  };



  const handleMoverReservaAJefe = async (delegado: DelegadoReserva) => {
    if (!procesoId) {
      toast.error("No hay proceso seleccionado");
      return;
    }
    try {
            await registrarJefeMutation.mutateAsync({
        nombres: delegado.usuario?.nombres || "",
        apellidos: delegado.usuario?.apellidos || "",
        numDocumento: delegado.usuario?.numDocumento || "",
        celular: delegado.usuario?.celular || "",
        procesoId,
        recintoId: recinto.id,
        tipo: "titular",
        enGrupoWhatsapp: delegado.enGrupoWhatsapp || false,
        tieneFotocopiaCarnet: delegado.tieneFotocopiaCarnet || false,
        agrupacionId: delegado.agrupacion?.id,
      });
      await eliminarDelegadoMutation.mutateAsync(delegado.id);
      toast.success("Reserva asignado como Jefe de Recinto");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al asignar como jefe");
    }
  };

  const handleMoverReservaAMesa = async (delegado: DelegadoReserva, mesa: Mesa) => {
    try {
      await actualizarDelegadoMutation.mutateAsync({
        id: delegado.id,
        data: {
          tipo: "titular",
          mesaId: mesa.id,
        },
      });
      toast.success(`Reserva asignado a Mesa ${mesa.numero}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al asignar a mesa");
    }
  };
const handleConvertirJefeADelegado = async (jefe: JefeRecinto, mesaId?: number, tipo?: string) => {
  try {
    await convertirJefeADelegadoMutation.mutateAsync({
      id: jefe.id,
      data: {
        tipo: tipo || "titular",
        mesaId: mesaId,
        enGrupoWhatsapp: jefe.enGrupoWhatsapp,
        tieneFotocopiaCarnet: jefe.tieneFotocopiaCarnet,
        agrupacionId: jefe.agrupacionId || undefined,
      },
    });
    toast.success(tipo === "titular" ? "Jefe convertido a delegado de mesa" : "Jefe convertido a reserva");
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Error al convertir jefe");
  }
};


const handleConvertirDelegadoAJefe = async (delegado: DelegadoMesaData | DelegadoReserva) => {
  if (!procesoId) {
    toast.error("No hay proceso seleccionado");
    return;
  }
  try {
    await convertirDelegadoAJefeMutation.mutateAsync({
      id: delegado.id,
      data: {
        tipo: "titular",
        enGrupoWhatsapp: delegado.enGrupoWhatsapp || false,
        tieneFotocopiaCarnet: delegado.tieneFotocopiaCarnet || false,
        agrupacionId: delegado.agrupacionId || delegado.agrupacion?.id || undefined,
      },
    });
    toast.success("Delegado convertido a Jefe de Recinto");
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Error al convertir a jefe");
  }
};
  const handleCloseJefeModal = (isOpen: boolean) => {
    setShowAgregarJefe(isOpen);
    if (!isOpen) setEditJefeData(null);
  };

  const handleCloseDelegadoModal = (isOpen: boolean) => {
    setShowAgregarDelegado(isOpen);
    if (!isOpen) {
      setEditDelegadoData(null);
      setSelectedMesa(null);
    }
  };

  const handleCloseReservaModal = (isOpen: boolean) => {
    setShowAgregarReserva(isOpen);
    if (!isOpen) setEditReservaData(null);
  };

const isMoving = registrarJefeMutation.isPending || actualizarDelegadoMutation.isPending || eliminarDelegadoMutation.isPending || convertirJefeADelegadoMutation.isPending || convertirDelegadoAJefeMutation.isPending;
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[850px] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <div className="space-y-2">
              <DialogTitle className="text-xl dark:text-gray-100">{recinto.nombre}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono dark:border-gray-600 dark:text-gray-300">
                  {recinto.codigo}
                </Badge>
                <Badge
                  variant={recinto.estado === "activo" ? "default" : "secondary"}
                  className={recinto.estado === "activo" ? "bg-green-500 text-xs" : "bg-gray-400 text-xs"}
                >
                  {recinto.estado || "inactivo"}
                </Badge>
                {recinto.resumenDelegados && (
                  <Badge className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-xs">
                    {recinto.resumenDelegados.titulares} titulares / {recinto.resumenDelegados.reservas} reservas
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground dark:text-gray-400">
                {recinto.localidad?.nombre} - {recinto.localidad?.municipio?.nombre}
              </div>
            </div>
          </DialogHeader>

          {isMoving && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          )}

          <div className="space-y-5">
            <div className="border rounded-xl p-4 bg-muted/20 dark:bg-gray-900/50 dark:border-gray-800">
              <h3 className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase mb-3">
                Jefe de Recinto
              </h3>
              <JefeSection
                jefes={recinto.jefes || []}
                mesasDisponibles={mesasDisponibles}
                onAgregar={() => {
                  setEditJefeData(null);
                  setShowAgregarJefe(true);
                }}
                onEditar={handleEditarJefe}
                onConvertirADelegado={handleConvertirJefeADelegado}
              />
            </div>

            <div className="border rounded-xl p-4 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase">
                  Mesas ({recinto.mesas?.length || 0})
                </h3>
              </div>

              {recinto.mesas?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recinto.mesas.map((mesa) => (
                    <div
                      key={mesa.id}
                      className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 dark:bg-gray-800/50 border-b dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-sky-700 dark:text-sky-400">
                            Mesa {mesa.numero}
                          </span>
                          <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded font-mono border dark:border-gray-700 dark:text-gray-300">
                            {mesa.codigo}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50">
                          {mesa.totalHabilitados} hab.
                        </Badge>
                      </div>

                      <div className="p-3">
                        <DelegadoCell
                          mesa={mesa}
                          onAgregar={() => handleAgregarDelegado(mesa)}
                          onEditar={handleEditarDelegado}
                          onMoverAReserva={handleMoverDelegadoAReserva}
                          onConvertirAJefe={handleConvertirDelegadoAJefe}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground dark:text-gray-400">
                  No hay mesas registradas
                </div>
              )}
            </div>

            <div className="border rounded-xl p-4 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-900/30">
              <ReservasSection
                delegadosReserva={recinto.delegadosReserva || []}
                mesasDisponibles={mesasDisponibles}
                hayJefe={hayJefe}
                onAgregar={() => {
                  setEditReservaData(null);
                  setShowAgregarReserva(true);
                }}
                onEditar={handleEditarReserva}
                onMoverAJefe={handleMoverReservaAJefe}
                onMoverAMesa={handleMoverReservaAMesa}
                onConvertirAJefe={handleConvertirDelegadoAJefe}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AgregarJefeModal
        open={showAgregarJefe}
        onOpenChange={handleCloseJefeModal}
        recintoId={recinto.id}
        recintoNombre={recinto.nombre}
        editData={editJefeData}
      />

      {selectedMesa && (
        <AgregarDelegadoModal
          open={showAgregarDelegado}
          onOpenChange={handleCloseDelegadoModal}
          mesaId={selectedMesa.id}
          mesaNumero={selectedMesa.numero}
          mesaCodigo={selectedMesa.codigo}
          recintoId={recinto.id}
          recintoNombre={recinto.nombre}
          editData={editDelegadoData}
        />
      )}

      <AgregarReservaModal
        open={showAgregarReserva}
        onOpenChange={handleCloseReservaModal}
        recintoId={recinto.id}
        recintoNombre={recinto.nombre}
        editData={editReservaData}
      />
    </>
  );
}