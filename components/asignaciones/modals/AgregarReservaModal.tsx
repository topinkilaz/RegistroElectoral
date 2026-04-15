"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProcess } from "@/lib/context/process-context";
import { useAgrupaciones } from "@/lib/hooks/useAgrupaciones";
import { useRegistrarDelegadoMesa, useActualizarDelegadoMesa } from "@/lib/hooks/useDelegadoMesa";
import { useUpdateUsuario, useVerificarUsuario } from "@/lib/hooks/useUsuarios";
import type { DelegadoReserva } from "@/lib/types/recinto";
import type { VerificarUsuarioResponse } from "@/lib/types/usuario";
import { VerificacionUsuarioDialog } from "./VerificacionUsuarioDialog";

interface AgregarReservaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recintoId: number;
  recintoNombre: string;
  editData?: DelegadoReserva | null;
}

interface FormData {
  nombres: string;
  apellidos: string;
  numDocumento: string;
  celular: string;
  enGrupoWhatsapp: boolean;
  tieneFotocopiaCarnet: boolean;
  agrupacionId: string;
}

const initialFormData: FormData = {
  nombres: "",
  apellidos: "",
  numDocumento: "",
  celular: "",
  enGrupoWhatsapp: false,
  tieneFotocopiaCarnet: false,
  agrupacionId: "",
};

export function AgregarReservaModal({
  open,
  onOpenChange,
  recintoId,
  recintoNombre,
  editData,
}: AgregarReservaModalProps) {
  const { procesoId } = useProcess();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { data: agrupaciones, isLoading: isLoadingAgrupaciones } = useAgrupaciones();
  const registrarMutation = useRegistrarDelegadoMesa();
  const actualizarDelegadoMutation = useActualizarDelegadoMesa();
  const actualizarUsuarioMutation = useUpdateUsuario();
  const verificarMutation = useVerificarUsuario();

  const [showVerificacion, setShowVerificacion] = useState(false);
  const [verificacionData, setVerificacionData] = useState<VerificarUsuarioResponse | null>(null);

  const isEditMode = !!editData;
  const isLoading = registrarMutation.isPending || actualizarDelegadoMutation.isPending || actualizarUsuarioMutation.isPending;

  useEffect(() => {
    if (open && editData) {
      setFormData({
        nombres: editData.usuario?.nombres || "",
        apellidos: editData.usuario?.apellidos || "",
        numDocumento: editData.usuario?.numDocumento || "",
        celular: editData.usuario?.celular || "",
        enGrupoWhatsapp: editData.enGrupoWhatsapp || false,
        tieneFotocopiaCarnet: editData.tieneFotocopiaCarnet || false,
        agrupacionId: editData.agrupacionId?.toString() || "", 
      });
    } else if (open && !editData) {
      setFormData(initialFormData);
    }
  }, [open, editData]);

  const handleClose = () => {
    setFormData(initialFormData);
    setShowVerificacion(false);
    setVerificacionData(null);
    onOpenChange(false);
  };

  const ejecutarRegistro = async () => {
    if (!procesoId) return;

    try {
      if (isEditMode && editData) {
        const usuarioId = editData.usuario?.id;
        if (usuarioId) {
          await actualizarUsuarioMutation.mutateAsync({
            id: usuarioId,
            data: {
              nombres: formData.nombres,
              apellidos: formData.apellidos,
              numDocumento: formData.numDocumento,
              celular: formData.celular,
            },
          });
        }

        await actualizarDelegadoMutation.mutateAsync({
          id: editData.id,
          data: {
            tipo: "reserva",
            enGrupoWhatsapp: formData.enGrupoWhatsapp,
            tieneFotocopiaCarnet: formData.tieneFotocopiaCarnet,
            agrupacionId: formData.agrupacionId && formData.agrupacionId !== "none"
              ? parseInt(formData.agrupacionId)
              : null,
          },
        });

        toast.success("Delegado reserva actualizado exitosamente");
      } else {
        await registrarMutation.mutateAsync({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          numDocumento: formData.numDocumento,
          celular: formData.celular,
          procesoId,
          recintoId,
          tipo: "reserva",
          enGrupoWhatsapp: formData.enGrupoWhatsapp,
          tieneFotocopiaCarnet: formData.tieneFotocopiaCarnet,
          agrupacionId: formData.agrupacionId && formData.agrupacionId !== "none"
            ? parseInt(formData.agrupacionId)
            : null,
        });
        toast.success("Delegado reserva registrado exitosamente");
      }
      setShowVerificacion(false);
      setVerificacionData(null);
      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Error al ${isEditMode ? "actualizar" : "registrar"} delegado reserva`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.numDocumento || !formData.celular) {
      toast.error("Complete todos los campos requeridos");
      return;
    }
    if (!procesoId) {
      toast.error("No hay proceso seleccionado");
      return;
    }

    try {
      const verificacion = await verificarMutation.mutateAsync({
        numDocumento: formData.numDocumento,
        celular: formData.celular,
      });

      const hayAdvertencias =
        (verificacion.ci.existe && verificacion.ci.usuario) ||
        (verificacion.celular.enUso && verificacion.celular.usuarios.length > 0);

      if (hayAdvertencias) {
        setVerificacionData(verificacion);
        setShowVerificacion(true);
      } else {
        await ejecutarRegistro();
      }
    } catch (error: any) {
      await ejecutarRegistro();
    }
  };

  const handleConfirmVerificacion = async () => {
    await ejecutarRegistro();
  };

  const handleCancelVerificacion = () => {
    setShowVerificacion(false);
    setVerificacionData(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar" : "Agregar"} Delegado Reserva</DialogTitle>
            <p className="text-sm text-muted-foreground">{recintoNombre}</p>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Nombres *</Label>
                <Input
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  placeholder="Nombres"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Apellidos *</Label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="Apellidos"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">N° Documento *</Label>
                <Input
                  value={formData.numDocumento}
                  onChange={(e) => setFormData({ ...formData, numDocumento: e.target.value })}
                  placeholder="Carnet de identidad"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Celular *</Label>
                <Input
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  placeholder="Número de celular"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Agrupación (opcional)</Label>
              <Select
                value={formData.agrupacionId}
                onValueChange={(value) => setFormData({ ...formData, agrupacionId: value })}
                disabled={isLoadingAgrupaciones}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar agrupación..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin agrupación</SelectItem>
                  {agrupaciones?.map((agr: any) => (
                    <SelectItem key={agr.id} value={agr.id.toString()}>
                      {agr.nombre} ({agr.sigla})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reserva-whatsapp"
                  checked={formData.enGrupoWhatsapp}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, enGrupoWhatsapp: checked })
                  }
                />
                <Label htmlFor="reserva-whatsapp" className="text-sm cursor-pointer">
                  En grupo WhatsApp
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reserva-carnet"
                  checked={formData.tieneFotocopiaCarnet}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, tieneFotocopiaCarnet: checked })
                  }
                />
                <Label htmlFor="reserva-carnet" className="text-sm cursor-pointer">
                  Tiene fotocopia carnet
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEditMode ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VerificacionUsuarioDialog
        open={showVerificacion}
        onOpenChange={setShowVerificacion}
        verificacion={verificacionData}
        onConfirm={handleConfirmVerificacion}
        onCancel={handleCancelVerificacion}
        isLoading={isLoading}
      />
    </>
  );
}