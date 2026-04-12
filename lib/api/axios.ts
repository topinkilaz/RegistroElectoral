import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
};

// Request interceptor - agregar token
api.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// Response interceptor - manejar refresh token
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Si es 401 y no es un retry ni una petición de auth
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes("/auth/")
		) {
			if (isRefreshing) {
				// Si ya se está refrescando, encolar esta petición
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem("refresh_token");

			if (!refreshToken) {
				isRefreshing = false;
				// No hay refresh token, redirigir al login
				localStorage.removeItem("token");
				localStorage.removeItem("refresh_token");
				localStorage.removeItem("user");
				window.location.href = "/login";
				return Promise.reject(error);
			}

			try {
				// Llamar al endpoint de refresh
				const response = await axios.post(`${API_URL}/auth/refresh`, {
					refresh_token: refreshToken,
				});

				const { token: newToken, refresh_token: newRefreshToken } = response.data;

				localStorage.setItem("token", newToken);
				if (newRefreshToken) {
					localStorage.setItem("refresh_token", newRefreshToken);
				}

				api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
				originalRequest.headers.Authorization = `Bearer ${newToken}`;

				processQueue(null, newToken);

				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				// Refresh falló, limpiar y redirigir al login
				localStorage.removeItem("token");
				localStorage.removeItem("refresh_token");
				localStorage.removeItem("user");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);
