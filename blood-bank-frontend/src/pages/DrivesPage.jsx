import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, MapPin } from 'lucide-react';
import { driveService } from '../services/api';

export default function DrivesPage({ onUpdate, currentAdmin }) {
  const [drives, setDrives] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const data = await driveService.getAll();
      setDrives(data);
    } catch (error) {
      console.error('Error fetching drives:', error);
    }
  };

  const DriveForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      admin_id: currentAdmin?.admin_id,
      drive_date: '',
      campus: '',
      venue: '',
      total_amount: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        await driveService.create(formData);
        await fetchDrives();
        if (onUpdate) onUpdate();
        onClose();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create drive');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 className="text-2xl font-bold text-gray-800">Create Blood Drive</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Drive Date *
                </label>
                <input
                  type="date"
                  value={formData.drive_date}
                  onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campus *
                </label>
                <input
                  type="text"
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Main Campus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Auditorium Hall A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Total Amount (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="50.0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if not yet determined
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Creating Drive...' : 'Create Drive'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const upcomingDrives = drives.filter(d => new Date(d.drive_date) >= new Date());
  const pastDrives = drives.filter(d => new Date(d.drive_date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Drive
        </button>
      </div>

      {/* Upcoming Drives */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Drives</h3>
        {upcomingDrives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingDrives.map(drive => (
              <div key={drive.drive_id} className="border-2 border-gray-200 rounded-lg p-5 hover:border-red-500 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{drive.venue}</h4>
                    <p className="text-gray-600 text-sm">{drive.campus}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Upcoming
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(drive.drive_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{drive.venue}</span>
                  </div>
                  {drive.total_amount && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">Expected Collection</p>
                      <p className="text-2xl font-bold text-red-600">{drive.total_amount}L</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No upcoming drives scheduled</p>
        )}
      </div>

      {/* Past Drives */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Past Drives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Drive ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Campus
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Collected
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastDrives.length > 0 ? (
                pastDrives.map(drive => (
                  <tr key={drive.drive_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      #{drive.drive_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(drive.drive_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {drive.campus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {drive.venue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {drive.total_amount ? `${drive.total_amount}L` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No past drives
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <DriveForm onClose={() => setShowForm(false)} />}
    </div>
  );
}   