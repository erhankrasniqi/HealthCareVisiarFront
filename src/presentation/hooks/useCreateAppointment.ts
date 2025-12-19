import { useState } from "react";
import { CreateAppointmentDto } from "@application/appointment/dtos/CreateAppointmentDto";
import { container } from "@/di/container";

export const useCreateAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createAppointment = async (data: CreateAppointmentDto) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await container.createAppointmentUseCase.execute(data);

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

  return { createAppointment, isLoading, error, success };
};
