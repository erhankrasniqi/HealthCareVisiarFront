"use client";

import { useAuthStore } from "@presentation/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { useCreateAppointment } from "@presentation/hooks/useCreateAppointment";
import { useDoctors } from "@presentation/hooks/useDoctors";
import { useAppointments } from "@presentation/hooks/useAppointments";
import { useDeleteAppointment } from "@presentation/hooks/useDeleteAppointment";
import { useRecommendDoctors, DoctorRecommendation } from "@presentation/hooks/useRecommendDoctors";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { createAppointment, isLoading, error, success } = useCreateAppointment();
  const { doctors, isLoading: doctorsLoading, error: doctorsError } = useDoctors();
  const { appointments, isLoading: appointmentsLoading, error: appointmentsError, refetch } = useAppointments();
  const { deleteAppointment, isDeleting } = useDeleteAppointment();
  const { recommendDoctors, isLoading: isRecommending } = useRecommendDoctors();
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([]);
  const [recommendMessage, setRecommendMessage] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
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
        setShowModal(false);
        setFormData({
          doctorId: "",
          appointmentDate: "",
          startTime: "",
          endTime: "",
          reason: "",
          symptoms: "",
        });
        refetch(); // Refresh appointments list
      }, 2000);
    }
  }, [success, refetch]);

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

  const handleDeleteClick = (id: string) => {
    setSelectedAppointmentId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointmentId) return;
    
    const result = await deleteAppointment(selectedAppointmentId);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedAppointmentId(null);
      refetch(); // Refresh list after delete
    }
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
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
                My Appointments
              </Link>
              <Link href="/appointments/book" className="text-gray-600 hover:text-gray-900">
                Book Appointment
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user.name}</span>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user.name}!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-600">
                <strong>User ID:</strong> {user.id}
              </p>
              <p className="text-gray-600">
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold shadow-md transition"
            >
              Create Appointment
            </button>
          </div>

          {/* Appointments Table */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Appointments</h3>
            </div>
            <div className="overflow-x-auto">
              {appointmentsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading appointments...</div>
              ) : appointmentsError ? (
                <div className="p-8 text-center text-red-600">{appointmentsError}</div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No appointments found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.doctorName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.doctorSpecialization || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.startTime} - {appointment.endTime}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {appointment.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteClick(appointment.id)}
                            className="text-red-600 hover:text-red-900 transition"
                            title="Delete appointment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                Appointment booked successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe Your Symptoms <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                  placeholder="Describe your symptoms here..."
                />
                <button
                  type="button"
                  onClick={handleRecommendClick}
                  disabled={isRecommending || !formData.symptoms}
                  className="mt-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecommending ? "🤖 Analyzing..." : "🤖 Get AI Recommendation"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
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
                    <option value="">-- Select a doctor --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Annual checkup"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">Delete Appointment</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAppointmentId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
