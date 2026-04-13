"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogIn, User, Lock } from "lucide-react";
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
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<LogIn className="mx-auto h-12 w-12 text-gray-400" />
				<CardTitle className="mt-4 text-2xl">Iniciar Sesión</CardTitle>
				<CardDescription>
					Ingresa tus credenciales para acceder
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="usuario"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Usuario</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												placeholder="Ingresa tu usuario"
												className="pl-10"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contraseña</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												type="password"
												placeholder="Ingresa tu contraseña"
												className="pl-10"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Ingresando..." : "Ingresar"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
