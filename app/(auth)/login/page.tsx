"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/lib/hooks/useLogin";
import { useAuth } from "@/lib/context/auth-context";
import { useProcess } from "@/lib/context/process-context";

const formSchema = z.object({
	usuario: z.string().min(1, {
		message: "El usuario es requerido.",
	}),
	password: z.string().min(1, {
		message: "La contraseña es requerida.",
	}),
});

export default function LoginPage() {
	const { login } = useAuth();
	const { clearProceso } = useProcess();
	const { mutate: loginMutation, isPending } = useLogin();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			usuario: "",
			password: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		loginMutation(values, {
			onSuccess: (data) => {
				if (data.success && data.token) {
					clearProceso();
					login(data.token, data.refresh_token, data.user);
					toast.success(data.message || "Inicio de sesión exitoso");
					window.location.href = "/seleccionar-proceso";
				} else {
					toast.error("Error en la respuesta del servidor");
				}
			},
			onError: (error) => {
				const message = error.response?.data?.message || "Error al iniciar sesión";
				toast.error(message);
			},
		});
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="w-full max-w-[350px] text-center bg-white/[0.06] border border-white/10 rounded-2xl px-8 backdrop-blur-sm"
		>
			<h1 className="text-white text-3xl mt-10 font-medium">
				Iniciar Sesión
			</h1>

			<p className="text-gray-400 text-sm mt-2">
				Ingresa tus credenciales para continuar
			</p>

			{/* Campo Usuario */}
			<div className="mt-6">
				<div
					className={`flex items-center w-full bg-white/5 ring-2 h-12 rounded-full overflow-hidden pl-5 gap-3 transition-all ${
						form.formState.errors.usuario
							? "ring-red-500/60"
							: "ring-white/10 focus-within:ring-sky-500/60"
					}`}
				>
					<User className="h-4 w-4 text-white/60 shrink-0" />
					<input
						type="text"
						placeholder="Usuario"
						className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none text-sm"
						{...form.register("usuario")}
					/>
				</div>
				{form.formState.errors.usuario && (
					<p className="text-red-400 text-xs mt-1 text-left pl-5">
						{form.formState.errors.usuario.message}
					</p>
				)}
			</div>

			{/* Campo Contraseña */}
			<div className="mt-4">
				<div
					className={`flex items-center w-full bg-white/5 ring-2 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-3 transition-all ${
						form.formState.errors.password
							? "ring-red-500/60"
							: "ring-white/10 focus-within:ring-sky-500/60"
					}`}
				>
					<Lock className="h-4 w-4 text-white/60 shrink-0" />
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Contraseña"
						className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none text-sm"
						{...form.register("password")}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="text-white/50 hover:text-white/80 transition-colors"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				</div>
				{form.formState.errors.password && (
					<p className="text-red-400 text-xs mt-1 text-left pl-5">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>

			{/* Botón Submit */}
			<button
				type="submit"
				disabled={isPending}
				className="mt-6 w-full h-11 rounded-full text-white font-medium bg-sky-600 hover:bg-sky-500 disabled:bg-sky-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
			>
				{isPending ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Ingresando...
					</>
				) : (
					"Ingresar"
				)}
			</button>

			<p className="text-gray-500 text-xs mt-4 mb-8">
				Sistema de Gestión Electoral
			</p>
		</form>
	);
}
