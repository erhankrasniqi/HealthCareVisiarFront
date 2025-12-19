import { useState } from "react";
import { LoginDto } from "@application/auth/dtos/LoginDto";
import { container } from "@/di/container";
import { useAuthStore } from "../store/authStore";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await container.loginUseCase.execute(credentials);

      if (result.isFailure) {
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }

      const { user, token } = result.value;
      setAuth(user, token);

      return { success: true, data: { user, token } };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
