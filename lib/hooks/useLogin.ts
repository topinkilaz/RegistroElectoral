import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginUser } from "@/lib/api/auth";
import type { LoginCredentials, LoginResponse } from "@/lib/types/auth";

interface ApiError {
	message: string;
	statusCode?: number;
}

export function useLogin() {
	return useMutation<LoginResponse, AxiosError<ApiError>, LoginCredentials>({
		mutationFn: loginUser,
	});
}
