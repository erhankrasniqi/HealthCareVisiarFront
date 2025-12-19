import { useState } from "react";
import { RegisterDto } from "@application/auth/dtos/RegisterDto";
import { container } from "@/di/container";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (credentials: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await container.registerUseCase.execute(credentials);

      if (result.isFailure) {
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }

      setSuccess(true);
      return { success: true, data: result.value };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, success };
};
