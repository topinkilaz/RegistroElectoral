"use client";

import { useAuth } from "@/lib/context/auth-context";
import { ROLES } from "@/lib/config/roles";
import { useMisDatosDelegado } from "@/lib/hooks/useDelegadoMesa";
import { useMisDatosJefeRecinto } from "@/lib/hooks/useJefeRecinto";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  User,
  Phone,
  FileText,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Hash,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProcess } from "@/lib/context/process-context";
import type { MisDatosDelegado } from "@/lib/types/delegado-mesa";
import type { MisDatosJefeRecinto, DelegadoMesaEnJefe } from "@/lib/types/jefe-recinto";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MiAsignacionPage() {
  const { userRoles, user, logout } = useAuth();

  const isJefeRecinto = userRoles.some(
    (role) => role.toUpperCase() === ROLES.JEFE_RECINTO
  );
  const isDelegado = userRoles.some(
    (role) => role.toUpperCase() === ROLES.DELEGADO
  );

  const {
    data: datosDelegado,
    isLoading: isLoadingDelegado,
    error: errorDelegado,
    refetch: refetchDelegado,
  } = useMisDatosDelegado(isDelegado && !isJefeRecinto);
const router = useRouter();
const { clearProceso } = useProcess();

const handleLogout = () => {
  clearProceso();
  logout();
  router.push("/login");
};

const getInitials = () => {
  if (!user) return "US";
  const nombres = user.nombres || "";
  const apellidos = user.apellidos || "";
  return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || "US";
};

const getFullName = () => {
  if (!user) return "Usuario";
  return `${user.nombres || ""} ${user.apellidos || ""}`.trim() || "Usuario";
};
  const {
    data: datosJefe,
    isLoading: isLoadingJefe,
    error: errorJefe,
    refetch: refetchJefe,
  } = useMisDatosJefeRecinto(isJefeRecinto);

  const isLoading = isLoadingDelegado || isLoadingJefe;
  const error = errorDelegado || errorJefe;

  const handleRefresh = () => {
    if (isJefeRecinto) {
      refetchJefe();
    } else {
      refetchDelegado();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar tu información. Por favor, intenta de nuevo.
            </p>
            <Button onClick={handleRefresh} className="bg-sky-600 hover:bg-sky-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
<div className="border-b bg-card">
  <div className="max-w-4xl mx-auto px-4 py-5">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          Hola, {user?.nombres}
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="border-sky-500 text-sky-600 text-xs">
            {isJefeRecinto ? "Jefe de Recinto" : "Delegado de Mesa"}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sky-600 text-white text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sky-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{getFullName()}</p>
                  <p className="text-xs text-muted-foreground">
                    {isJefeRecinto ? "Jefe de Recinto" : "Delegado de Mesa"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRefresh} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</div>

      {/* Content - TODO en un solo card */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {isJefeRecinto && datosJefe && datosJefe.length > 0 && (
          <JefeRecintoSingleCard datos={datosJefe} />
        )}

        {isDelegado && !isJefeRecinto && datosDelegado && datosDelegado.length > 0 && (
          <DelegadoSingleCard datos={datosDelegado} />
        )}

        {/* No data message */}
        {((isJefeRecinto && (!datosJefe || datosJefe.length === 0)) ||
          (isDelegado && !isJefeRecinto && (!datosDelegado || datosDelegado.length === 0))) && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sin asignaciones</h2>
              <p className="text-muted-foreground">
                No tienes asignaciones registradas en el sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// TODO EN UN SOLO CARD - Jefe de Recinto
function JefeRecintoSingleCard({ datos }: { datos: MisDatosJefeRecinto[] }) {
  return (
    <div className="space-y-4">
      {datos.map((jefe) => (
        <Card key={jefe.id} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header del card: Proceso Electoral como título principal */}
            <div className="border-b bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/20 dark:to-transparent p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sky-600" />
                  <h2 className="text-lg font-bold">{jefe.proceso?.nombre}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={jefe.tipo === "titular" ? "bg-sky-600" : "bg-amber-500"}>
                    {jefe.tipo === "titular" ? "Titular" : "Reserva"}
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {jefe.estado}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Recinto como subtítulo destacado */}
              {jefe.recinto && (
                <div className="border-l-4 border-sky-500 pl-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-sky-600" />
                    <h3 className="font-semibold text-base">{jefe.recinto.nombre}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Código: {jefe.recinto.codigo}
                    </span>
                    {jefe.recinto.localidad && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {jefe.recinto.localidad.nombre}
                        {jefe.recinto.localidad.municipio && (
                          <span> • {jefe.recinto.localidad.municipio.nombre}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Documentación - tamaño muy pequeño */}
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <span className="text-muted-foreground">Documentación:</span>
                  <StatusBadgeTiny label="Grupo WhatsApp" active={jefe.enGrupoWhatsapp} />
                  <StatusBadgeTiny label="Fotocopia Carnet" active={jefe.tieneFotocopiaCarnet} />
                  {jefe.agrupacion && (
                    <span className="text-muted-foreground">
                      Agrupación: <span className="font-medium">{jefe.agrupacion.nombre}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t my-2" />

              {/* Delegados */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Delegados a tu cargo</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {jefe.delegadosMesa?.length || 0}
                  </Badge>
                </div>

                {jefe.delegadosMesa && jefe.delegadosMesa.length > 0 ? (
                  <div className="space-y-2">
                    {jefe.delegadosMesa.map((delegado) => (
                      <DelegadoRow key={delegado.id} delegado={delegado} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No hay delegados asignados</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Fila compacta de delegado
function DelegadoRow({ delegado }: { delegado: DelegadoMesaEnJefe }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
          <User className="h-4 w-4 text-sky-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">
              {delegado.usuario?.nombres} {delegado.usuario?.apellidos}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5">
              {delegado.tipo}
            </Badge>
            {delegado.mesa && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                Mesa #{delegado.mesa.numero}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>CI: {delegado.usuario?.numDocumento}</span>
            <span>Cel: {delegado.usuario?.celular}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
  {delegado.enGrupoWhatsapp ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  ) : (
    <XCircle className="h-3.5 w-3.5 text-gray-300" />
  )}
  {delegado.tieneFotocopiaCarnet ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  ) : (
    <XCircle className="h-3.5 w-3.5 text-gray-300" />
  )}
</div>
    </div>
  );
}

// TODO EN UN SOLO CARD - Delegado
function DelegadoSingleCard({ datos }: { datos: MisDatosDelegado[] }) {
  const delegadoTitular = datos.find((d) => d.tipo === "titular");
  const delegadoReserva = datos.find((d) => d.tipo === "reserva");
  const delegado = delegadoTitular || delegadoReserva;

  if (!delegado) return null;

  const isReserva = delegado.tipo === "reserva";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header: Proceso Electoral como título principal */}
        <div className="border-b bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/20 dark:to-transparent p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-bold">{delegado.proceso?.nombre}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={!isReserva ? "bg-sky-600" : "bg-amber-500"}>
                {delegado.tipo === "titular" ? "Titular" : "Reserva"}
              </Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {delegado.estado}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Alerta de reserva si aplica */}
          {isReserva && (
            <div className="flex items-start gap-2 p-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Delegado de reserva - Serás notificado cuando se te asigne una mesa.
              </p>
            </div>
          )}

          {/* Recinto como subtítulo destacado */}
          {delegado.mesa?.recinto && (
            <div className="border-l-4 border-sky-500 pl-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-600" />
                <h3 className="font-semibold text-base">{delegado.mesa.recinto.nombre}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Código: {delegado.mesa.recinto.codigo}
                </span>
                {delegado.mesa.recinto.localidad && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {delegado.mesa.recinto.localidad.nombre}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mesa asignada (solo para titular) */}
          {!isReserva && delegado.mesa && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <span className="text-lg font-bold">#{delegado.mesa.numero}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Código de mesa</p>
                <p className="text-base font-semibold">{delegado.mesa.codigo}</p>
              </div>
            </div>
          )}

          {/* Documentación - tamaño muy pequeño */}
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <span className="text-muted-foreground">Documentación:</span>
              <StatusBadgeTiny label="Grupo WhatsApp" active={delegado.enGrupoWhatsapp} />
              <StatusBadgeTiny label="Fotocopia Carnet" active={delegado.tieneFotocopiaCarnet} />
              {delegado.agrupacion && (
                <span className="text-muted-foreground">
                  Agrupación: <span className="font-medium">{delegado.agrupacion.nombre}</span>
                </span>
              )}
            </div>
          </div>

          {/* Jefe de Recinto */}
          {delegado.jefeRecinto && delegado.jefeRecinto.usuario && (
            <>
              <div className="border-t my-2" />
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {delegado.jefeRecinto.usuario.nombres} {delegado.jefeRecinto.usuario.apellidos}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Cel: {delegado.jefeRecinto.usuario.celular}</span>
                    <span>CI: {delegado.jefeRecinto.usuario.numDocumento}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fecha de registro */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>
              Registrado el{" "}
              {new Date(delegado.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Badge súper pequeño para documentación
function StatusBadgeTiny({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-2.5 w-2.5" />
      ) : (
        <XCircle className="h-2.5 w-2.5" />
      )}
      {label}
    </span>
  );
}