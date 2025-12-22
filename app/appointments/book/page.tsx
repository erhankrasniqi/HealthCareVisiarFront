"use client";

import { useAuthStore } from "@presentation/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { useCreateAppointment } from "@presentation/hooks/useCreateAppointment";
import { useDoctors } from "@presentation/hooks/useDoctors";
import { useRecommendDoctors, DoctorRecommendation } from "@presentation/hooks/useRecommendDoctors";
import Link from "next/link";

export default function BookAppointmentPage() {
  const { user, isAuthenticated, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { createAppointment, isLoading, error, success } = useCreateAppointment();
  const { doctors, isLoading: doctorsLoading, error: doctorsError } = useDoctors();
  const { recommendDoctors, isLoading: isRecommending } = useRecommendDoctors();
  
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([]);
  const [recommendMessage, setRecommendMessage] = useState("");
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    symptoms: "",
  });

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, _hasHydrated]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        router.push("/appointments");
      }, 2000);
    }
  }, [success, router]);

  const handleLogout = async () => {
    clearAuth();
    router.push("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Combine reason and symptoms
    const fullReason = formData.symptoms 
      ? `${formData.reason}\n\nSymptoms: ${formData.symptoms}`
      : formData.reason;
    
    await createAppointment({
      doctorId: formData.doctorId,
      appointmentDate: formData.appointmentDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      reason: fullReason,
    });
  };

  const handleRecommendClick = async () => {
    if (!formData.symptoms || formData.symptoms.trim().length === 0) {
      alert("Please describe your symptoms first");
      return;
    }

    const result = await recommendDoctors(formData.symptoms);
    if (result.success) {
      setRecommendations(result.recommendations || []);
      setRecommendMessage(result.message || "");
      setShowRecommendModal(true);
    }
  };

  const handleSelectRecommendation = (doctorId: string) => {
    setFormData({ ...formData, doctorId });
    setShowRecommendModal(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
                My Appointments
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book New Appointment</h2>

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                Appointment booked successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Symptoms <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Describe your symptoms here to help us find the right doctor for you..."
                />
                <button
                  type="button"
                  onClick={handleRecommendClick}
                  disabled={isRecommending || !formData.symptoms}
                  className="mt-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecommending ? "🤖 Analyzing..." : "🤖 Get AI Recommendation"}
                </button>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor *
                </label>
                {doctorsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Loading doctors...
                  </div>
                ) : doctorsError ? (
                  <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
                    {doctorsError}
                  </div>
                ) : (
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Choose a doctor --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Annual checkup, follow-up visit, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/appointments"
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-center font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                >
                  {isLoading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>

      {/* AI Recommendation Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">🤖 AI Doctor Recommendations</h3>
              <button
                onClick={() => setShowRecommendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{recommendMessage}</p>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recommendations found. Please try describing your symptoms differently.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleSelectRecommendation(rec.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rec.fullName}</h4>
                        <p className="text-sm text-indigo-600">{rec.specialization}</p>
                      </div>
                      {rec.matchScore > 0 && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {rec.matchScore > 2 ? "Highly Recommended" : "Recommended"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                    <button
                      type="button"
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Select this doctor →
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRecommendModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
