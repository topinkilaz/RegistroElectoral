"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserInfo } from "@/lib/types/auth";
import {
	type Role,
	hasRole as checkHasRole,
	hasRouteAccess as checkRouteAccess,
	getPrimaryRole,
	isAdmin as checkIsAdmin,
} from "@/lib/config/roles";

interface AuthContextType {
	user: UserInfo | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	userRoles: string[];
	primaryRole: Role | null;
	login: (token: string, refreshToken: string, user: UserInfo) => void;
	logout: () => void;
	updateToken: (token: string, refreshToken?: string) => void;
	hasRole: (role: Role) => boolean;
	hasRouteAccess: (route: string) => boolean;
	isAdmin: () => boolean;
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
	const userRoles = user?.roles ?? [];
	const primaryRole = getPrimaryRole(userRoles);

	const hasRole = useCallback(
		(role: Role) => checkHasRole(userRoles, role),
		[userRoles]
	);

	const hasRouteAccess = useCallback(
		(route: string) => checkRouteAccess(userRoles, route),
		[userRoles]
	);

	const isAdmin = useCallback(() => checkIsAdmin(userRoles), [userRoles]);

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				refreshToken,
				isAuthenticated,
				isLoading,
				userRoles,
				primaryRole,
				login,
				logout,
				updateToken,
				hasRole,
				hasRouteAccess,
				isAdmin,
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
