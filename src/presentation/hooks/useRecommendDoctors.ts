import { useState } from "react";

export interface DoctorRecommendation {
  id: string;
  fullName: string;
  specialization: string;
  matchScore: number;
  reason: string;
}

export const useRecommendDoctors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendDoctors = async (symptoms: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/doctors/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get recommendations");
      }

      const data = await response.json();
      return { 
        success: true, 
        recommendations: data.recommendations as DoctorRecommendation[],
        message: data.message 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage, recommendations: [] };
    } finally {
      setIsLoading(false);
    }
  };

  return { recommendDoctors, isLoading, error };
};
