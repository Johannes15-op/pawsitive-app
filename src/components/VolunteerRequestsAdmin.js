import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import volunteerService from '../services/volunteerService';

const VolunteerRequestsAdmin = ({ setCurrentScreen }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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

  const sortedApplications = [...applications].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA; 
  });

  const filteredApplications = sortedApplications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      (app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       app.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
        <div 
          onClick={() => handleFilterChange('all')}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
            filter === 'all' ? 'ring-2 ring-pink-500 shadow-lg' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
          <div className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</div>
          {filter === 'all' && totalPages > 1 && (
            <div className="text-xs text-gray-500 mt-1">{totalPages} pages</div>
          )}
        </div>
        <div 
          onClick={() => handleFilterChange('pending')}
          className={`bg-yellow-50 rounded-lg shadow-md p-4 cursor-pointer transition-all ${
            filter === 'pending' ? 'ring-2 ring-yellow-500 shadow-lg' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-xs md:text-sm text-yellow-700 mb-1">Pending</div>
          <div className="text-xl md:text-2xl font-bold text-yellow-800">{stats.pending}</div>
          {filter === 'pending' && totalPages > 1 && (
            <div className="text-xs text-yellow-600 mt-1">{totalPages} pages</div>
          )}
        </div>
        <div 
          onClick={() => handleFilterChange('approved')}
          className={`bg-green-50 rounded-lg shadow-md p-4 cursor-pointer transition-all ${
            filter === 'approved' ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-xs md:text-sm text-green-700 mb-1">Approved</div>
          <div className="text-xl md:text-2xl font-bold text-green-800">{stats.approved}</div>
          {filter === 'approved' && totalPages > 1 && (
            <div className="text-xs text-green-600 mt-1">{totalPages} pages</div>
          )}
        </div>
        <div 
          onClick={() => handleFilterChange('rejected')}
          className={`bg-red-50 rounded-lg shadow-md p-4 cursor-pointer transition-all ${
            filter === 'rejected' ? 'ring-2 ring-red-500 shadow-lg' : 'hover:shadow-lg'
          }`}
        >
          <div className="text-xs md:text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-xl md:text-2xl font-bold text-red-800">{stats.rejected}</div>
          {filter === 'rejected' && totalPages > 1 && (
            <div className="text-xs text-red-600 mt-1">{totalPages} pages</div>
          )}
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
                onClick={() => handleFilterChange(status)}
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
      <div className="mb-4 bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing {filteredApplications.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} of {filteredApplications.length} applications
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="space-y-4 mb-6">
        {currentApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">
              {searchTerm 
                ? `No applications found matching "${searchTerm}"`
                : `No ${filter === 'all' ? '' : filter} applications found`
              }
            </p>
          </div>
        ) : (
          currentApplications.map((application) => (
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
                    {application.phone && <p>📱 {application.phone}</p>}
                    {application.dateOfBirth && <p>🎂 {application.dateOfBirth}</p>}
                    <p className="text-xs text-gray-500">Applied: {formatDate(application.createdAt)}</p>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-3 mb-4">
                {}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-blue-800">
                      {application.hasVolunteerExperience === 'yes' ? '✓' : '☐'} Previous volunteer experience:
                    </span>
                    <span className={`text-sm font-medium ${application.hasVolunteerExperience === 'yes' ? 'text-blue-900' : 'text-gray-600'}`}>
                      {application.hasVolunteerExperience === 'yes' ? 'Yes' : application.hasVolunteerExperience === 'no' ? 'No' : 'Not specified'}
                    </span>
                  </div>
                  {application.hasVolunteerExperience === 'yes' && application.volunteerExperienceDescription && (
                    <div className="mt-2 pl-6">
                      <p className="text-xs text-gray-700 italic">"{application.volunteerExperienceDescription}"</p>
                    </div>
                  )}
                </div>

                {}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-green-800">
                      {application.hasAnimalExperience === 'yes' ? '✓' : '☐'} Experience handling animals:
                    </span>
                    <span className={`text-sm font-medium ${application.hasAnimalExperience === 'yes' ? 'text-green-900' : 'text-gray-600'}`}>
                      {application.hasAnimalExperience === 'yes' ? 'Yes' : application.hasAnimalExperience === 'no' ? 'No' : 'Not specified'}
                    </span>
                  </div>
                </div>

                {}
                {application.specialSkills && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-purple-800 mb-1">Special skills:</p>
                    <p className="text-xs md:text-sm text-purple-900">{application.specialSkills}</p>
                  </div>
                )}

                {}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">Why they want to volunteer:</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{application.motivation}</p>
                </div>
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

      {}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            {}
            <div className="flex gap-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerRequestsAdmin;