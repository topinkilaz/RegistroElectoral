"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Plus,
	MoreHorizontal,
	Pencil,
	Key,
	UserX,
	UserCheck,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Eye,
	EyeOff,
	Shield,
	 MessageSquare,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
	useUsuarios,
	useCreateUsuario,
	useUpdateUsuario,
	useCambiarPassword,
	useCambiarEstado,
	useReemplazarRol,
} from "@/lib/hooks/useUsuarios";
import type {
	Usuario,
	RolNombre,
	EstadoUsuario,
	CreateUsuarioDto,
	UpdateUsuarioDto,
} from "@/lib/types/usuario";
import { PermisosModal } from "@/components/usuarios/permisos-modal";
import WhatsAppIcon from "@/components/whatsapp-icon";


export default function UsersPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");

	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [permisosModalOpen, setPermisosModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
const [confirmNewPassword, setConfirmNewPassword] = useState("");

	const [newUser, setNewUser] = useState<CreateUsuarioDto>({
		nombres: "",
		apellidos: "",
		numDocumento: "",
		celular: "",
		estado: "ACTIVO",
		rol: ["VISOR"],
	});
	const [editUser, setEditUser] = useState<UpdateUsuarioDto>({});
	const [selectedRoles, setSelectedRoles] = useState<RolNombre[]>(["VISOR"]);
	const [newPassword, setNewPassword] = useState("");

	const { data, isLoading, isError } = useUsuarios({
		page,
		limit: 10,
		search: searchTerm || undefined,
	});
	const createMutation = useCreateUsuario();
	const updateMutation = useUpdateUsuario();
	const passwordMutation = useCambiarPassword();
	const estadoMutation = useCambiarEstado();
	const reemplazarRolMutation = useReemplazarRol();

	const handleSearch = () => {
		setSearchTerm(search);
		setPage(1);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

const handleCreate = async () => {
  try {
    await createMutation.mutateAsync(newUser);
    toast.success("Usuario creado exitosamente");
    setCreateModalOpen(false);
    setNewUser({
      nombres: "",
      apellidos: "",
      numDocumento: "",
      celular: "",
      estado: "ACTIVO",
      rol: ["VISOR"],
    });
  } catch (error: any) {
   
    if (error?.response?.data?.message) {
    
      const errorMessage = error.response.data.message;
      
     
      if (errorMessage === "Usuario ya existe") {
        toast.error("El número de documento ya está registrado. Por favor, use otro.");
      } else if (Array.isArray(errorMessage)) {
   
        toast.error(errorMessage.join(", "));
      } else {
        toast.error(errorMessage);
      }
    } else if (error?.message) {
     
      toast.error(error.message);
    } else {
      toast.error("Error al crear usuario. Por favor, intente nuevamente.");
    }
  }
};

const handleEdit = async () => {
	if (!selectedUser) return;
	try {
		await updateMutation.mutateAsync({ id: selectedUser.id, data: editUser });

		
		const tieneRolesPermitidos = selectedUser.roles.some(rol => ["ADMIN", "EDITOR", "VISOR"].includes(rol.nombre));
		
		if (tieneRolesPermitidos) {
			const rolesOriginales = selectedUser.roles.map(r => r.nombre).sort().join(",");
			const rolesNuevos = [...selectedRoles].sort().join(",");
			if (rolesOriginales !== rolesNuevos) {
				await reemplazarRolMutation.mutateAsync({
					id: selectedUser.id,
					data: { rol: selectedRoles }
				});
			}
		}

		toast.success("Usuario actualizado exitosamente");
		setEditModalOpen(false);
		setSelectedUser(null);
	} catch {
		toast.error("Error al actualizar usuario");
	}
};
const handleChangePassword = async () => {
  if (!selectedUser) return;
  

  if (newPassword !== confirmNewPassword) {
    toast.error("Las contraseñas no coinciden");
    return;
  }
  
  try {
    await passwordMutation.mutateAsync({
      id: selectedUser.id,
      data: { password: newPassword },
    });
    toast.success("Contraseña actualizada exitosamente");
    setPasswordModalOpen(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setSelectedUser(null);
  } catch {
    toast.error("Error al cambiar contraseña");
  }
};

	const handleToggleEstado = async (user: Usuario) => {
		const nuevoEstado: EstadoUsuario = user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
		try {
			await estadoMutation.mutateAsync({
				id: user.id,
				data: { estado: nuevoEstado },
			});
			toast.success(`Usuario ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`);
		} catch {
			toast.error("Error al cambiar estado");
		}
	};

	const openEditModal = (user: Usuario) => {
	setSelectedUser(user);
	setEditUser({
		nombres: user.nombres,
		apellidos: user.apellidos,
		numDocumento: user.numDocumento,
		celular: user.celular,
		usuario: user.usuario,
	});
	
	
	const tieneRolesPermitidos = user.roles.some(rol => ["ADMIN", "EDITOR", "VISOR"].includes(rol.nombre));
	if (tieneRolesPermitidos) {
		setSelectedRoles(user.roles.map(r => r.nombre) || ["VISOR"]);
	} else {
		setSelectedRoles([]); 
	}
	
	setEditModalOpen(true);
};

const openPasswordModal = (user: Usuario) => {
  setSelectedUser(user);
  setNewPassword("");
  setConfirmNewPassword("");
  setShowNewPassword(false);
  setShowConfirmNewPassword(false);
  setPasswordModalOpen(true);
};

const openPermisosModal = (user: Usuario) => {
	setSelectedUser(user);
	setPermisosModalOpen(true);
};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Nunca";
		return new Date(dateString).toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
					<p className="text-muted-foreground">
						Gestiona las cuentas y permisos de usuarios.
					</p>
				</div>
				<Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					Nuevo Usuario
				</Button>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Todos los Usuarios</CardTitle>
					<div className="flex items-center gap-4 w-1/3">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar usuarios..."
								className="pl-8"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={handleKeyDown}
							/>
						</div>
						<Button onClick={handleSearch} size="sm">Buscar</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : isError ? (
						<div className="text-center py-8 text-red-500">
							Error al cargar usuarios
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="text-left">Acciones</TableHead>
										<TableHead>Usuario</TableHead>
										<TableHead>Documento</TableHead>
										<TableHead>Celular</TableHead>
										<TableHead>Rol</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead>Último Acceso</TableHead>
										
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.data.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="text-left">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => openEditModal(user)}
															className="flex items-center gap-2"
														>
															<Pencil className="h-4 w-4" />
															Editar
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => openPasswordModal(user)}
															className="flex items-center gap-2"
														>
															<Key className="h-4 w-4" />
															Cambiar Contraseña
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => openPermisosModal(user)}
															className="flex items-center gap-2"
														>
															<Shield className="h-4 w-4" />
															Permisos
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleToggleEstado(user)}
															className="flex items-center gap-2"
														>
															{user.estado === "ACTIVO" ? (
																<>
																	<UserX className="h-4 w-4" />
																	Desactivar
																</>
															) : (
																<>
																	<UserCheck className="h-4 w-4" />
																	Activar
																</>
															)}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
											<TableCell>
												<div>
													<div className="font-medium">
														{user.nombres} {user.apellidos}
													</div>
													<div className="text-sm text-muted-foreground">
														@{user.usuario}
													</div>
												</div>
											</TableCell>
											<TableCell>{user.numDocumento}</TableCell>
											<TableCell>
  <div className="flex items-center gap-2">
    <span>{user.celular}</span>
    {user.celular && (
      <a
        href={`https://wa.me/591${user.celular.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 hover:text-green-700 transition-colors"
        title="Enviar mensaje por WhatsApp"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
    )}
  </div>
</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{user.roles.length > 0 ? (
														user.roles.map((rol) => (
															<Badge
																key={rol.id}
																variant={
																	rol.nombre === "ADMIN"
																		? "default"
																		: rol.nombre === "EDITOR"
																			? "secondary"
																			: "outline"
																}
															>
																{rol.nombre}
															</Badge>
														))
													) : (
														<Badge variant="outline">Sin rol</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={user.estado === "ACTIVO" ? "default" : "secondary"}
													className={
														user.estado === "ACTIVO"
															? "bg-green-500 hover:bg-green-600"
															: "bg-gray-500"
													}
												>
													{user.estado}
												</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatDate(user.ultimoAcceso)}
											</TableCell>
											
										</TableRow>
									))}
								</TableBody>
							</Table>

							{data?.pagination && (
								<div className="flex items-center justify-between mt-4">
									<p className="text-sm text-muted-foreground">
										Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.totalItems} usuarios)
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => p - 1)}
											disabled={!data.pagination.hasPreviousPage}
										>
											<ChevronLeft className="h-4 w-4" />
											Anterior
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => p + 1)}
											disabled={!data.pagination.hasNextPage}
										>
											Siguiente
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuevo Usuario</DialogTitle>
						<DialogDescription>
							Completa los datos para registrar un nuevo usuario.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Nombres</Label>
								<Input
									value={newUser.nombres}
									onChange={(e) => setNewUser({ ...newUser, nombres: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Apellidos</Label>
								<Input
									value={newUser.apellidos}
									onChange={(e) => setNewUser({ ...newUser, apellidos: e.target.value })}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Nº Documento (Se usará como : USUARIO)</Label>
								<Input
									value={newUser.numDocumento}
									onChange={(e) => setNewUser({ ...newUser, numDocumento: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Celular Whatsapp(Se usará como : CONTRASEÑA)</Label>
								<Input
									value={newUser.celular}
									onChange={(e) => setNewUser({ ...newUser, celular: e.target.value })}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Roles</Label>
								<div className="flex flex-col gap-2 p-3 border rounded-md">
									{(["ADMIN", "EDITOR", "VISOR"] as RolNombre[]).map((rol) => (
										<div key={rol} className="flex items-center gap-2">
											<Checkbox
												id={`new-rol-${rol}`}
												checked={newUser.rol.includes(rol)}
												onCheckedChange={(checked: boolean) => {
													if (checked) {
														setNewUser({ ...newUser, rol: [...newUser.rol, rol] });
													} else {
														const filtered = newUser.rol.filter(r => r !== rol);
														setNewUser({ ...newUser, rol: filtered.length > 0 ? filtered : ["VISOR"] });
													}
												}}
											/>
											<Label htmlFor={`new-rol-${rol}`} className="cursor-pointer font-normal">
												{rol}
											</Label>
										</div>
									))}
								</div>
							</div>
							<div className="space-y-2">
								<Label>Estado</Label>
								<Select
									value={newUser.estado}
									onValueChange={(value: EstadoUsuario) => setNewUser({ ...newUser, estado: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ACTIVO">ACTIVO</SelectItem>
										<SelectItem value="INACTIVO">INACTIVO</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							{createMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Crear"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Usuario</DialogTitle>
						<DialogDescription>
							Modifica los datos del usuario.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Nombres</Label>
								<Input
									value={editUser.nombres || ""}
									onChange={(e) => setEditUser({ ...editUser, nombres: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Apellidos</Label>
								<Input
									value={editUser.apellidos || ""}
									onChange={(e) => setEditUser({ ...editUser, apellidos: e.target.value })}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Nº Documento </Label>
								<Input
									value={editUser.numDocumento || ""}
									onChange={(e) => setEditUser({ ...editUser, numDocumento: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Celular Whatsapp</Label>
								<Input
									value={editUser.celular || ""}
									onChange={(e) => setEditUser({ ...editUser, celular: e.target.value })}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Usuario</Label>
							<Input
								value={editUser.usuario || ""}
								onChange={(e) => setEditUser({ ...editUser, usuario: e.target.value })}
							/>
						</div>
						
{selectedUser?.roles?.some(rol => ["ADMIN", "EDITOR", "VISOR"].includes(rol.nombre)) && (
	<div className="space-y-2">
		<Label>Roles</Label>
		<div className="flex flex-col gap-2 p-3 border rounded-md">
			{(["ADMIN", "EDITOR", "VISOR"] as RolNombre[]).map((rol) => (
				<div key={rol} className="flex items-center gap-2">
					<Checkbox
						id={`edit-rol-${rol}`}
						checked={selectedRoles.includes(rol)}
						onCheckedChange={(checked: boolean) => {
							if (checked) {
								setSelectedRoles([...selectedRoles, rol]);
							} else {
								const filtered = selectedRoles.filter(r => r !== rol);
								setSelectedRoles(filtered.length > 0 ? filtered : ["VISOR"]);
							}
						}}
					/>
					<Label htmlFor={`edit-rol-${rol}`} className="cursor-pointer font-normal">
						{rol}
					</Label>
				</div>
			))}
		</div>
	</div>
)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleEdit} disabled={updateMutation.isPending || reemplazarRolMutation.isPending}>
	{updateMutation.isPending || reemplazarRolMutation.isPending ? (
		<Loader2 className="h-4 w-4 animate-spin" />
	) : (
		"Guardar"
	)}
</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Password Modal */}
<Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cambiar Contraseña</DialogTitle>
      <DialogDescription>
        Ingresa la nueva contraseña para {selectedUser?.nombres}.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Nueva Contraseña</Label>
        <div className="relative">
          <Input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Confirmar Contraseña</Label>
        <div className="relative">
          <Input
            type={showConfirmNewPassword ? "text" : "password"}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => {
        setPasswordModalOpen(false);
        setNewPassword("");
        setConfirmNewPassword("");
      }}>
        Cancelar
      </Button>
      <Button onClick={handleChangePassword} disabled={passwordMutation.isPending}>
        {passwordMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Cambiar"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

			{/* Permisos Modal */}
			<PermisosModal
				open={permisosModalOpen}
				onOpenChange={setPermisosModalOpen}
				usuario={selectedUser}
			/>
		</div>
	);
}