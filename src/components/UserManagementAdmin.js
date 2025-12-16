import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Shield, User, RefreshCw, Filter } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const UserManagementAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    console.log('👥 Loading users...');
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersList = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          lastLogin: userData.lastLogin?.toDate?.() || null
        });
      });
      
      console.log('✅ Users loaded:', usersList.length);
      setUsers(usersList);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      alert('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    
 
    const userRole = user.role?.toLowerCase();
    const matchesRole = 
      filterRole === 'all' || 
      (filterRole === 'admin' && userRole === 'admin') ||
      (filterRole === 'user' && userRole !== 'admin');
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    if (role?.toLowerCase() === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
          <Shield size={12} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
        <User size={12} />
        User
      </span>
    );
  };

  const getStats = () => {
    return {
      total: users.length,
      admins: users.filter(u => u.role?.toLowerCase() === 'admin').length,
      regularUsers: users.filter(u => u.role?.toLowerCase() !== 'admin').length,
      recentlyActive: users.filter(u => {
        if (!u.lastLogin) return false;
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return new Date(u.lastLogin) > dayAgo;
      }).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <p className="text-gray-600 text-sm mt-1">View and manage registered users</p>
          </div>
          
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 w-fit"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Users size={24} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <User size={24} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm opacity-90">Regular Users</p>
                <p className="text-2xl font-bold">{stats.regularUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm opacity-90">Active (24h)</p>
                <p className="text-2xl font-bold">{stats.recentlyActive}</p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">Users Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
        </div>

        {}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">No users found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterRole !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No registered users yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Last Login
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 min-w-max">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 whitespace-nowrap">{user.fullName || 'No Name'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1 min-w-max">
                          <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate">{user.email || 'N/A'}</span>
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                              <Phone size={14} className="flex-shrink-0" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="min-w-max">
                          {getRoleBadge(user.role)}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(user.lastLogin)}
                      </td>
                      
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-pink-500 hover:text-pink-700 font-medium text-sm whitespace-nowrap"
                        >
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

        {}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h4>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-800">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-800">{selectedUser.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">User ID</p>
                    <p className="text-gray-800 text-sm break-all">{selectedUser.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Account Status</p>
                    <p className="text-gray-800">Active</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Account Created</p>
                    <p className="text-gray-800">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Last Login</p>
                    <p className="text-gray-800">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                </div>

                {}
                {selectedUser.address && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Address</p>
                    <p className="text-gray-800">{selectedUser.address}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementAdmin;