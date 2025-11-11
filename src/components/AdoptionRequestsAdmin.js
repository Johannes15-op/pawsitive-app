import React, { useState, useEffect } from 'react';
import { Heart, Check, X, Clock, Mail, Phone, MapPin, FileText, Calendar, User } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import adoptionService from '../services/adoptionService';

const AdoptionRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const result = await adoptionService.getAllAdoptionRequests();
    if (result.success) {
      setRequests(result.data);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (requestId, newStatus, petId, userId) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this adoption request?`)) {
      return;
    }

    setActionLoading(true);
    
    try {
      
      const result = await adoptionService.updateAdoptionStatus(requestId, newStatus, adminNotes);
      
      if (result.success) {
       
        if (newStatus === 'approved' && petId) {
          try {
            const petRef = doc(db, 'pets', petId);
            await updateDoc(petRef, {
              status: 'adopted',
              adoptedBy: userId,
              adoptedAt: new Date(),
              updatedAt: new Date()
            });
            console.log('✅ Pet marked as adopted:', petId);
          } catch (petError) {
            console.error('Error updating pet status:', petError);
          
          }
        }
        
        alert(`✅ Request ${newStatus} successfully!${newStatus === 'approved' ? ' Pet has been marked as adopted.' : ''}`);
        setSelectedRequest(null);
        setAdminNotes('');
        loadRequests();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating adoption status:', error);
      alert(`❌ Error: ${error.message}`);
    }
    
    setActionLoading(false);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return req.status !== 'deleted';
    return req.status === filter && req.status !== 'deleted';
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <Check size={16} />;
      case 'rejected': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
       {}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="text-pink-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Adoption Requests</h1>
            <p className="text-gray-600">Review and manage adoption applications</p>
          </div>
        </div>

        {}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-white text-pink-600 shadow' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({requests.filter(r => r.status !== 'deleted').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-white text-yellow-600 shadow' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'approved' ? 'bg-white text-green-600 shadow' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'rejected' ? 'bg-white text-red-600 shadow' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Rejected ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

     {}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Heart className="text-gray-300 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Requests Found</h3>
          <p className="text-gray-600">No adoption requests in this category yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
             {}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Heart className="text-pink-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{request.petName}</h3>
                    <p className="text-sm text-gray-600">Request ID: {request.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="capitalize">{request.status}</span>
                </span>
              </div>

              {}
              <div className="grid md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-700">{request.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-600">{request.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-600">{request.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin size={16} className="text-gray-500 mt-0.5" />
                    <span className="text-gray-600">{request.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-600">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
              </div>

              {}
              {selectedRequest?.id === request.id ? (
                <div className="border-t pt-4">
                  {}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="font-semibold text-gray-700">Why they want to adopt:</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.reason}</p>
                  </div>

                  {}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${request.hasExperience ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <span className="text-sm font-medium text-gray-700">
                        {request.hasExperience ? '✅' : '❌'} Pet Care Experience
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg ${request.hasOtherPets ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <span className="text-sm font-medium text-gray-700">
                        {request.hasOtherPets ? '✅' : '❌'} Has Other Pets
                      </span>
                    </div>
                  </div>

                  {}
                  {request.status === 'pending' && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes (Optional)</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this request..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                  )}

                  {}
                  {request.status === 'pending' && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>📝 Note:</strong> When you approve this request, the pet will automatically be marked as <strong>"Adopted"</strong> in the system.
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'approved', request.petId, request.userId)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Check size={20} />
                          <span>{actionLoading ? 'Processing...' : 'Approve & Mark as Adopted'}</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'rejected', request.petId, request.userId)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <X size={20} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </>
                  )}

                  {}
                  {request.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Approved:</strong> This pet has been marked as adopted in the system.
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
                        ❌ <strong>Rejected:</strong> This adoption request was not approved.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Hide Details
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="w-full text-pink-600 hover:text-pink-700 text-sm font-medium py-2 border-t"
                >
                  View Full Details →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdoptionRequestsAdmin;