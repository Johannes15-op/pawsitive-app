import React, { useState, useEffect } from 'react';
import { Heart, Check, X, Clock, Mail, Phone, FileText, Calendar, User, Home, Eye, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import adoptionService from '../services/adoptionService';

const AdoptionRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    
    try {
      console.log('📥 Loading adoption requests from Firestore...');
      const result = await adoptionService.getAllAdoptionRequests();
      
      if (result.success) {
        console.log('✅ Loaded adoption requests:', result.data.length);
        console.log('📋 First request sample:', result.data[0]);
        
   
        if (result.data.length > 0) {
          const firstRequest = result.data[0];
          console.log('🖼️ Valid ID URL exists:', !!firstRequest.validIdUrl);
          console.log('🖼️ Valid ID starts with:', firstRequest.validIdUrl?.substring(0, 50));
          console.log('🏠 Proof of Residence URL exists:', !!firstRequest.proofOfResidenceUrl);
          console.log('🏠 Proof starts with:', firstRequest.proofOfResidenceUrl?.substring(0, 50));
        }
        
        setRequests(result.data);
      } else {
        console.error('❌ Failed to load requests:', result.error);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Error loading adoption requests:', error);
      setRequests([]);
    }
    
    setLoading(false);
  };

  const handleViewImage = (imageUrl, title) => {
    if (!imageUrl) {
      alert('No image available for this document.');
      return;
    }
    
    console.log('📸 Opening image:', title);
    console.log('📸 Image URL length:', imageUrl.length);
    console.log('📸 Image starts with:', imageUrl.substring(0, 100));
    
    setSelectedImage(imageUrl);
    setImageTitle(title);
    setShowImageModal(true);
  };

  const handleStatusUpdate = async (requestId, newStatus, petId, userId) => {
    const confirmMessage = newStatus === 'approved' 
      ? 'Are you sure you want to APPROVE this adoption request?\n\n✅ This will:\n• Mark the pet as "Adopted"\n• Send approval notification to user\n• Notify user about home visit inspection'
      : 'Are you sure you want to REJECT this adoption request?\n\n❌ This will:\n• Mark the pet as "Available" again\n• Send rejection notification to user';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading(true);
    
    try {
      console.log('📝 Updating adoption status:', { requestId, newStatus, adminNotes });
      
      const result = await adoptionService.updateAdoptionStatus(requestId, newStatus, adminNotes);
      
      if (result.success) {
        alert(`✅ Request ${newStatus} successfully!`);
        setSelectedRequest(null);
        setAdminNotes('');
        await loadRequests(); 
      } else {
        alert(`❌ Error: ${result.error || 'Failed to update status'}`);
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

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    
      const d = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading adoption requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-gray-800">{imageTitle}</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage}
                alt={imageTitle}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  console.error('❌ Image failed to load');
                  console.error('❌ Image URL:', selectedImage?.substring(0, 200));
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0VGNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRmFpbGVkIHRvIExvYWQ8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <p className="text-gray-600 mb-2">
                  <strong>Image Format:</strong> {selectedImage.startsWith('data:image/jpeg') ? 'JPEG' : selectedImage.startsWith('data:image/png') ? 'PNG' : 'Unknown'}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Size:</strong> {(selectedImage.length / 1024).toFixed(2)} KB
                </p>
                <details className="cursor-pointer">
                  <summary className="text-gray-700 font-semibold">View Image Data (First 200 chars)</summary>
                  <p className="text-gray-600 break-all mt-2 font-mono text-xs">
                    {selectedImage.substring(0, 200)}...
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <>
          <div className="grid gap-4 mb-6">
            {currentRequests.map((request) => (
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
                      <span className="text-gray-600">{request.email || request.userEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-600">{request.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-gray-600">{formatDate(request.createdAt)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {request.validIdUrl ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <FileText size={16} className="text-blue-500" />
                          <button
                            onClick={() => handleViewImage(request.validIdUrl, `Valid ID - ${request.fullName}`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                          >
                            View Valid ID <Eye size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertCircle size={16} className="text-red-500" />
                          <span className="text-red-600">No Valid ID uploaded</span>
                        </div>
                      )}
                      {request.proofOfResidenceUrl ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <Home size={16} className="text-green-500" />
                          <button
                            onClick={() => handleViewImage(request.proofOfResidenceUrl, `Proof of Residence - ${request.fullName}`)}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 hover:underline"
                          >
                            View Proof of Residence <Eye size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertCircle size={16} className="text-red-500" />
                          <span className="text-red-600">No Proof of Residence uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {}
                {selectedRequest?.id === request.id ? (
                  <div className="border-t pt-4">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText size={16} className="text-gray-500" />
                        <span className="font-semibold text-gray-700">Why they want to adopt:</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.reason}</p>
                    </div>

                   {}
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Pet Ownership History</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Current Pets:</strong> {request.hasCurrentPets === 'yes' ? `Yes - ${request.currentPetsDetails}` : 'No'}</p>
                        {request.hasCurrentPets === 'yes' && (
                          <p><strong>Are they vaccinated?:</strong> {request.arePetsVaccinated === 'yes' ? 'Yes' : 'No'}</p>
                        )}
                        <p><strong>Adopted before?:</strong> {request.hasAdoptedBefore === 'yes' ? 'Yes' : 'No'}</p>
                        {request.previousPetsHistory && (
                          <p><strong>Previous pets history:</strong> {request.previousPetsHistory}</p>
                        )}
                        <p><strong>Home Inspection Consent:</strong> {request.homeInspectionConsent ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Admin Notes (Optional - for rejection reason)
                          </label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add notes or rejection reason..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            rows="3"
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'approved', request.petId, request.userId)}
                            disabled={actionLoading}
                            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <Check size={20} />
                            <span>{actionLoading ? 'Processing...' : '✅ Approve'}</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'rejected', request.petId, request.userId)}
                            disabled={actionLoading}
                            className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <X size={20} />
                            <span>❌ Reject</span>
                          </button>
                        </div>
                      </>
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

          {}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(indexOfLastItem, filteredRequests.length)}</span> of{' '}
                  <span className="font-semibold">{filteredRequests.length}</span> requests
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-300'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-pink-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-300'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdoptionRequestsAdmin;