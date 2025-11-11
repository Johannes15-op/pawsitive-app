import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Eye, Calendar, CheckCircle, RefreshCw, TrendingUp, Download, X } from 'lucide-react';
import donationService from '../services/donationService';

const DonationManagementAdmin = ({ onUpdate }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  // Wrap loadDonations with useCallback to memoize it
  const loadDonations = useCallback(async () => {
    console.log('📥 Loading donations...');
    setLoading(true);
    try {
      const result = await donationService.getAllDonations();
      
      if (result.success) {
        console.log('✅ Donations loaded:', result.data.length);
        const processedDonations = result.data.map(d => ({
          ...d,
          timestamp: d.timestamp?.toDate?.() || d.createdAt?.toDate?.() || new Date(),
          createdAt: d.createdAt?.toDate?.() || new Date()
        }));
        
        setDonations(processedDonations);
        calculateStats(processedDonations);
        
        if (onUpdate) onUpdate();
      } else {
        console.error('❌ Failed to load donations:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]); // Add onUpdate as dependency

  useEffect(() => {
    loadDonations();
  }, [loadDonations]); // Now we can safely include loadDonations

  const calculateStats = (donationsList) => {
    const total = donationsList.reduce((sum, d) => sum + (d.amount || 0), 0);
    const count = donationsList.length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonth = donationsList
      .filter(d => {
        const donationDate = d.timestamp || d.createdAt;
        return donationDate.getMonth() === currentMonth && 
               donationDate.getFullYear() === currentYear;
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const lastMonthDate = new Date(currentYear, currentMonth - 1);
    const lastMonth = donationsList
      .filter(d => {
        const donationDate = d.timestamp || d.createdAt;
        return donationDate.getMonth() === lastMonthDate.getMonth() && 
               donationDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    
    setStats({ total, count, thisMonth, lastMonth });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Donation Records</h2>
          <p className="text-gray-600 text-sm mt-1">View all donations received</p>
        </div>
        
        <button
          onClick={loadDonations}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-fit"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 mb-6 max-w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={18} className="flex-shrink-0" />
            <CheckCircle size={14} className="opacity-80 flex-shrink-0" />
          </div>
          <p className="text-xs opacity-90 mb-0.5 truncate">Total Donations</p>
          <p className="text-lg font-bold truncate">{formatCurrency(stats.total)}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="flex-shrink-0" />
          </div>
          <p className="text-xs opacity-90 mb-0.5 truncate">Total Count</p>
          <p className="text-lg font-bold">{stats.count}</p>
          <p className="text-xs opacity-75 truncate">donation{stats.count !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="flex-shrink-0" />
          </div>
          <p className="text-xs opacity-90 mb-0.5 truncate">This Month</p>
          <p className="text-lg font-bold truncate">{formatCurrency(stats.thisMonth)}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="flex-shrink-0" />
          </div>
          <p className="text-xs opacity-90 mb-0.5 truncate">Last Month</p>
          <p className="text-lg font-bold truncate">{formatCurrency(stats.lastMonth)}</p>
        </div>
      </div>

      {/* Donations Table */}
      {donations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg font-medium">No donations yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Donations from users will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{donation.userName || donation.donorName}</p>
                        <p className="text-sm text-gray-500 truncate">{donation.userEmail}</p>
                        {donation.phoneNumber && (
                          <p className="text-sm text-gray-500 whitespace-nowrap">📱 {donation.phoneNumber}</p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(donation.amount)}
                      </p>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {donation.paymentMethod}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(donation.timestamp)}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="flex items-center gap-2 text-pink-500 hover:text-pink-700 font-medium text-sm transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Donation Details</h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Donor Name</p>
                  <p className="text-lg font-medium text-gray-800">{selectedDonation.userName || selectedDonation.donorName}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2">Amount</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedDonation.amount)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Method</p>
                  <p className="text-lg text-gray-800">{selectedDonation.paymentMethod}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Date & Time</p>
                  <p className="text-lg text-gray-800">{formatDate(selectedDonation.timestamp)}</p>
                </div>

                {selectedDonation.phoneNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Phone Number</p>
                    <p className="text-lg text-gray-800">{selectedDonation.phoneNumber}</p>
                  </div>
                )}

                {selectedDonation.userEmail && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Email Address</p>
                    <p className="text-lg text-gray-800 break-all">{selectedDonation.userEmail}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              {selectedDonation.message && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Message from Donor</p>
                  <p className="text-gray-800 italic">"{selectedDonation.message}"</p>
                </div>
              )}

              {/* Receipt */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-800">Receipt/Proof of Payment</h4>
                  {selectedDonation.receiptUrl && (
                    <a
                      href={selectedDonation.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>

                {selectedDonation.receiptUrl ? (
                  <div className="space-y-3">
                    {/* Image */}
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={selectedDonation.receiptUrl} 
                        alt="Payment Receipt"
                        className="w-full h-auto object-contain max-h-[500px] cursor-pointer"
                        onClick={() => window.open(selectedDonation.receiptUrl, '_blank')}
                        onError={(e) => {
                          console.error('Failed to load receipt image:', selectedDonation.receiptUrl);
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Receipt image loaded successfully');
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center p-8 bg-red-50 gap-3">
                        <p className="text-red-600 font-semibold text-lg">Unable to load receipt image</p>
                        <p className="text-red-500 text-sm">The image may have been deleted or the link is broken</p>
                        <div className="flex gap-2">
                          <a
                            href={selectedDonation.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            Open in New Tab
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedDonation.receiptUrl);
                              alert('Receipt URL copied to clipboard!');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Copy URL
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hint */}
                    <p className="text-xs text-gray-500 text-center">
                      Click on the image to view in full size
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                    <DollarSign size={48} className="mx-auto text-yellow-500 mb-3" />
                    <p className="text-yellow-800 font-medium">No receipt uploaded for this donation</p>
                    <p className="text-yellow-600 text-sm mt-1">The donor did not provide a receipt image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setSelectedDonation(null)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagementAdmin;