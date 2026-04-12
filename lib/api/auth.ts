import { api } from "./axios";
import type { LoginCredentials, LoginResponse } from "@/lib/types/auth";

export async function loginUser(
	credentials: LoginCredentials
): Promise<LoginResponse> {
	const { data } = await api.post<LoginResponse>("/auth/login", credentials);
	return data;
}
