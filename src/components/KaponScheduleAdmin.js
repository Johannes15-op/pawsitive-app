import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Check, X, Eye, Trash2, AlertCircle } from 'lucide-react';
import kaponService from '../services/kaponService';
import notificationService from '../services/notificationService';

const KaponScheduleAdmin = () => {
  const [activeView, setActiveView] = useState('schedules');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    capacity: 50,
    requirements: ''
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const result = await kaponService.getAllSchedules();
      if (result.success) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
    setLoading(false);
  };

  const loadRegistrations = async (scheduleId) => {
    try {
      const result = await kaponService.getScheduleRegistrations(scheduleId);
      if (result.success) {
        setRegistrations(result.data);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const scheduleData = {
      title: formData.title,
      date: new Date(formData.date),
      time: `${formData.startTime} - ${formData.endTime}`, 
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      requirements: formData.requirements,
      status: 'active',
      registeredCount: 0,
      createdAt: new Date()
    };

    try {
      const result = await kaponService.createSchedule(scheduleData);
      
      if (result.success) {
        alert('Schedule created successfully!');
        setFormData({
          title: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          description: '',
          capacity: 50,
          requirements: ''
        });
        setActiveView('schedules');
        loadSchedules();
      } else {
        alert('Error creating schedule: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule: ' + error.message);
    }
  };

  const handleApproveRequest = async (requestId, registration) => {
    if (window.confirm('Approve this Kapon request?')) {
      setActionLoading(requestId);
      try {
        const result = await kaponService.updateRequestStatus(requestId, 'approved');
        if (result.success) {
        
          await notificationService.createNotification({
            userId: registration.userId,
            type: 'kapon_approved',
            title: 'Kapon Request Approved',
            message: `Your kapon request for ${registration.petName} has been approved for ${selectedSchedule.title}!`,
            relatedId: requestId,
            metadata: {
              petName: registration.petName,
              scheduleId: selectedSchedule.id,
              scheduleName: selectedSchedule.title
            }
          });
          
          alert('Request approved! Notification sent to user.');
          await loadRegistrations(selectedSchedule.id);
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRejectRequest = async (requestId, registration) => {
    const notes = prompt('Reason for rejection (optional):');
    if (notes === null) return;
    
    setActionLoading(requestId);
    try {
      const result = await kaponService.updateRequestStatus(requestId, 'rejected', notes);
      if (result.success) {
       
        await notificationService.createNotification({
          userId: registration.userId,
          type: 'kapon_rejected',
          title: 'Kapon Request Declined',
          message: `Your kapon request for ${registration.petName} could not be approved. ${notes ? `Reason: ${notes}` : 'Please contact us for more information.'}`,
          relatedId: requestId,
          metadata: {
            petName: registration.petName,
            reason: notes,
            scheduleId: selectedSchedule.id,
            scheduleName: selectedSchedule.title
          }
        });
        
        alert('Request rejected! Notification sent to user.');
        await loadRegistrations(selectedSchedule.id);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    if (window.confirm('Mark this request as completed?')) {
      setActionLoading(requestId);
      try {
        const result = await kaponService.updateRequestStatus(requestId, 'completed');
        if (result.success) {
       
          const registration = registrations.find(r => r.id === requestId);
          
        
          
          await notificationService.createNotification({
            userId: registration.userId,
            type: 'kapon_completed',
            title: 'Kapon Event Completed',
            message: `The kapon event for ${registration.petName} has been completed! Thank you for participating in ${selectedSchedule.title}.`,
            relatedId: requestId,
            metadata: {
              petName: registration.petName,
              scheduleId: selectedSchedule.id,
              scheduleName: selectedSchedule.title
            }
          });
          
          alert('Request marked as completed! Notification sent to user.');
          await loadRegistrations(selectedSchedule.id);
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Error completing request:', error);
        alert('Error completing request');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      try {
        const result = await kaponService.deleteSchedule(scheduleId);
        if (result.success) {
          alert('Schedule deleted!');
          loadSchedules();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Error deleting schedule');
      }
    }
  };

  const handleViewRegistrations = (schedule) => {
    setSelectedSchedule(schedule);
    loadRegistrations(schedule.id);
    setActiveView('registrations');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Invalid Date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kapon Schedule Management</h2>
        <button
          onClick={() => setActiveView('create')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Create Schedule</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveView('schedules')}
          className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeView === 'schedules'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Schedules
        </button>
        <button
          onClick={() => {
            if (selectedSchedule) {
              setActiveView('registrations');
            } else {
              alert('Please select a schedule first');
            }
          }}
          className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeView === 'registrations'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Registrations
        </button>
      </div>

      {activeView === 'create' && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Kapon Schedule</h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., FREE Kapon Event - June 2024"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., Tabaco City Veterinary Clinic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Event details and information..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Maximum Slots)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Pet requirements (age, vaccination, fasting, etc.)"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create Schedule
              </button>
              <button
                type="button"
                onClick={() => setActiveView('schedules')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'schedules' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Schedules Yet</h3>
              <p className="text-gray-500 mb-6">Create your first Kapon schedule to get started.</p>
              <button
                onClick={() => setActiveView('create')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create Schedule
              </button>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 break-words">
                        {schedule.title}
                      </h3>
                      <p className="text-sm text-gray-600 break-words line-clamp-2">
                        {schedule.description}
                      </p>
                    </div>
                    <span className={`${getStatusBadge(schedule.status)} px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap self-start`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-pink-500 flex-shrink-0" />
                    <span className="text-sm break-words">{formatDate(schedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-pink-500 flex-shrink-0" />
                    <span className="text-sm">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-pink-500 flex-shrink-0" />
                    <span className="text-sm break-words">{schedule.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <Users size={18} className="text-purple-500 flex-shrink-0" />
                  <span>{schedule.registeredCount || 0} / {schedule.capacity} registered</span>
                </div>

                {schedule.requirements && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Requirements:</p>
                    <p className="text-xs text-gray-700 whitespace-pre-line break-words">{schedule.requirements}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewRegistrations(schedule)}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    <span>View Registrations</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium sm:ml-auto"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'registrations' && selectedSchedule && (
        <div>
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-4">
            <button
              onClick={() => setActiveView('schedules')}
              className="text-pink-500 hover:text-pink-600 mb-4 flex items-center gap-1 font-medium"
            >
              Back to Schedules
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-2 break-words">{selectedSchedule.title}</h3>
            <p className="text-gray-600 text-sm mb-4 break-words">
              {formatDate(selectedSchedule.date)} • {selectedSchedule.startTime} - {selectedSchedule.endTime} • {selectedSchedule.location}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={18} className="text-purple-500 flex-shrink-0" />
              <span>{registrations.length} / {selectedSchedule.capacity} slots filled</span>
            </div>
          </div>

          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Registrations Yet</h3>
                <p className="text-gray-500">Waiting for users to register for this event.</p>
              </div>
            ) : (
              registrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-xl shadow-md p-4 md:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 mb-1 break-words">{registration.ownerName}</h4>
                        <p className="text-sm text-gray-600 mb-1 break-words">{registration.userEmail}</p>
                        <p className="text-sm text-gray-600 break-words">{registration.contactNumber}</p>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Pet Information:</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Name: {registration.petName}</p>
                            <p className="text-sm text-gray-600">Type: {registration.petType}</p>
                            <p className="text-sm text-gray-600">Gender: {registration.gender}</p>
                            <p className="text-sm text-gray-600">Breed: {registration.breed}</p>
                            <p className="text-sm text-gray-600">Age: {registration.age}</p>
                          </div>
                        </div>

                        {registration.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs font-semibold text-blue-800 mb-1">Additional Notes:</p>
                            <p className="text-xs text-gray-700 break-words">{registration.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 self-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                          registration.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {registration.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {registration.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApproveRequest(registration.id, registration)}
                          disabled={actionLoading === registration.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          <Check size={16} />
                          <span>{actionLoading === registration.id ? 'Processing...' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(registration.id, registration)}
                          disabled={actionLoading === registration.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          <X size={16} />
                          <span>{actionLoading === registration.id ? 'Processing...' : 'Reject'}</span>
                        </button>
                      </div>
                    )}

                    {registration.status === 'approved' && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleCompleteRequest(registration.id)}
                          disabled={actionLoading === registration.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          <Check size={16} />
                          <span>{actionLoading === registration.id ? 'Processing...' : 'Mark as Completed'}</span>
                        </button>
                      </div>
                    )}

                    {registration.adminNotes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-t border-gray-200">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">Admin Notes:</p>
                        <p className="text-xs text-gray-700 break-words">{registration.adminNotes}</p>
                      </div>
                    )}

                    {registration.createdAt && (
                      <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                        Registered: {registration.createdAt.toDate ? registration.createdAt.toDate().toLocaleString() : new Date(registration.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KaponScheduleAdmin;