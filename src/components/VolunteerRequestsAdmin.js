import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import volunteerService from '../services/volunteerService';

const VolunteerRequestsAdmin = ({ setCurrentScreen }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const result = await volunteerService.getAllApplications();
    
    if (result.success) {
      setApplications(result.data);
    }
    
    setLoading(false);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this application?`)) {
      return;
    }

    setProcessingId(applicationId);
    
    const result = await volunteerService.updateStatus(applicationId, status);
    
    if (result.success) {
      alert(result.message);
      await loadApplications();
    } else {
      alert('Error updating status: ' + result.error);
    }
    
    setProcessingId(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      (app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon size={14} />
        <span>{badge.label}</span>
      </span>
    );
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Volunteer Applications</h2>
        <p className="text-gray-600">Review and manage volunteer applications</p>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
          <div className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-md p-4">
          <div className="text-xs md:text-sm text-yellow-700 mb-1">Pending</div>
          <div className="text-xl md:text-2xl font-bold text-yellow-800">{stats.pending}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <div className="text-xs md:text-sm text-green-700 mb-1">Approved</div>
          <div className="text-xl md:text-2xl font-bold text-green-800">{stats.approved}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4">
          <div className="text-xs md:text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-xl md:text-2xl font-bold text-red-800">{stats.rejected}</div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="space-y-4">
          {}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">
                      {application.firstName} {application.lastName}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
                    <p className="break-all">📧 {application.email}</p>
                    <p>📱 {application.phone}</p>
                    <p>🎂 {application.dateOfBirth}</p>
                    <p className="text-xs text-gray-500">Applied: {formatDate(application.createdAt)}</p>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">Why they want to volunteer:</h4>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{application.motivation}</p>
              </div>

             {}
              {application.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'approved')}
                    disabled={processingId === application.id}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <UserCheck size={18} />
                    <span>{processingId === application.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    disabled={processingId === application.id}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <UserX size={18} />
                    <span>{processingId === application.id ? 'Processing...' : 'Reject'}</span>
                  </button>
                </div>
              )}

              {application.status !== 'pending' && (
                <div className="text-xs md:text-sm text-gray-500">
                  Reviewed on: {formatDate(application.reviewedAt)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteerRequestsAdmin;