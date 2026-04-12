"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserInfo } from "@/lib/types/auth";

interface AuthContextType {
	user: UserInfo | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string, refreshToken: string, user: UserInfo) => void;
	logout: () => void;
	updateToken: (token: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserInfo | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAuth = () => {
			try {
				const storedToken = localStorage.getItem("token");
				const storedRefreshToken = localStorage.getItem("refresh_token");
				const storedUser = localStorage.getItem("user");

				if (storedToken) {
					setToken(storedToken);
				}
				if (storedRefreshToken) {
					setRefreshToken(storedRefreshToken);
				}
				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}
			} catch (error) {
				console.error("Error loading auth:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadAuth();
	}, []);

	const login = useCallback((newToken: string, newRefreshToken: string, newUser: UserInfo) => {
		localStorage.setItem("token", newToken);
		localStorage.setItem("refresh_token", newRefreshToken);
		localStorage.setItem("user", JSON.stringify(newUser));

		setToken(newToken);
		setRefreshToken(newRefreshToken);
		setUser(newUser);
	}, []);

	const updateToken = useCallback((newToken: string, newRefreshToken?: string) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);

		if (newRefreshToken) {
			localStorage.setItem("refresh_token", newRefreshToken);
			setRefreshToken(newRefreshToken);
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		localStorage.removeItem("refresh_token");
		localStorage.removeItem("user");
		setToken(null);
		setRefreshToken(null);
		setUser(null);
	}, []);

	const isAuthenticated = !!token;

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				refreshToken,
				isAuthenticated,
				isLoading,
				login,
				logout,
				updateToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth debe usarse dentro de un AuthProvider");
	}
	return context;
}
