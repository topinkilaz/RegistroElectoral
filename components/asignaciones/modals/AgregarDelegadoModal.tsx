"use client";

import { useState } from "react";
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
import { useRegistrarDelegadoMesa } from "@/lib/hooks/useDelegadoMesa";

interface AgregarDelegadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesaId: number;
  mesaNumero: string;
  mesaCodigo: string;
  recintoId: number;
  recintoNombre: string;
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

export function AgregarDelegadoModal({
  open,
  onOpenChange,
  mesaId,
  mesaNumero,
  mesaCodigo,
  recintoId,
  recintoNombre,
}: AgregarDelegadoModalProps) {
  const { procesoId } = useProcess();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { data: agrupaciones, isLoading: isLoadingAgrupaciones } = useAgrupaciones();
  const registrarMutation = useRegistrarDelegadoMesa();

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
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
      await registrarMutation.mutateAsync({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        numDocumento: formData.numDocumento,
        celular: formData.celular,
        procesoId,
        recintoId,
        mesaId,
        tipo: "titular",
        enGrupoWhatsapp: formData.enGrupoWhatsapp,
        tieneFotocopiaCarnet: formData.tieneFotocopiaCarnet,
        agrupacionId: formData.agrupacionId && formData.agrupacionId !== "none"
          ? parseInt(formData.agrupacionId)
          : undefined,
      });
      toast.success("Delegado titular registrado exitosamente");
      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al registrar delegado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Agregar Delegado Titular</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Mesa {mesaNumero} ({mesaCodigo}) - {recintoNombre}
          </p>
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
                id="delegado-whatsapp"
                checked={formData.enGrupoWhatsapp}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, enGrupoWhatsapp: checked })
                }
              />
              <Label htmlFor="delegado-whatsapp" className="text-sm cursor-pointer">
                En grupo WhatsApp
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="delegado-carnet"
                checked={formData.tieneFotocopiaCarnet}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, tieneFotocopiaCarnet: checked })
                }
              />
              <Label htmlFor="delegado-carnet" className="text-sm cursor-pointer">
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
              disabled={registrarMutation.isPending}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {registrarMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
