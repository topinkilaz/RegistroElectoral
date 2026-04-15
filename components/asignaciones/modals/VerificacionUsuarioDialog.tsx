"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Phone, Loader2 } from "lucide-react";
import type { VerificarUsuarioResponse } from "@/lib/types/usuario";

interface VerificacionUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificacion: VerificarUsuarioResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VerificacionUsuarioDialog({
  open,
  onOpenChange,
  verificacion,
  onConfirm,
  onCancel,
  isLoading,
}: VerificacionUsuarioDialogProps) {
  if (!verificacion) return null;

  const { ci, celular } = verificacion;
  const hayAdvertenciaCi = ci.existe && ci.usuario;
  const hayAdvertenciaCelular = celular.enUso && celular.usuarios.length > 0;

  // Si no hay advertencias, no mostrar el dialog
  if (!hayAdvertenciaCi && !hayAdvertenciaCelular) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Advertencia de Verificación
          </DialogTitle>
          <DialogDescription>
            Se encontraron los siguientes datos ya registrados en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hayAdvertenciaCi && ci.usuario && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    CI ya registrado
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    El CI <span className="font-mono font-semibold">{ci.usuario.numDocumento}</span> pertenece a:
                  </p>
                  <div className="bg-white dark:bg-gray-900 rounded p-2 mt-2 border dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {ci.usuario.nombres} {ci.usuario.apellidos}
                    </p>
                    {ci.usuario.celular && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tel: {ci.usuario.celular}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Se utilizarán los datos del usuario existente para este registro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hayAdvertenciaCelular && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-orange-800 dark:text-orange-400">
                    Celular en uso
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Este número ya está registrado para:
                  </p>
                  <div className="space-y-2 mt-2">
                    {celular.usuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="bg-white dark:bg-gray-900 rounded p-2 border dark:border-gray-800"
                      >
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {usuario.nombres} {usuario.apellidos}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          CI: {usuario.numDocumento}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Continuar de todas formas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
