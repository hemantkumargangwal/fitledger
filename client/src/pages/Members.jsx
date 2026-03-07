import { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { Plus, Search, Edit, Trash2, Filter, Users, Calendar, Phone, Mail, MoreVertical, ChevronDown, UserPlus, AlertTriangle, Clock, CheckCircle, XCircle, ArrowUpDown, RefreshCw } from 'lucide-react';
import { MembersPageSkeleton } from '../components/SkeletonLoader';
import Alert from '../components/Alert';
import { memberService } from '../services/memberService';
import { formatDate, getInitials } from '../utils/formatters';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, MEMBER_STATUS } from '../utils/constants';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joiningDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    joiningDate: '',
    planDuration: ''
  });

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await memberService.getMembers(params);
      setMembers(response.members || []);
      setTotalPages(response.totalPages || 1);
      
      // Show success toast
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Members Loaded',
          message: `Loaded ${response.members?.length || 0} members successfully`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      
      // Show error toast
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading Error',
          message: ERROR_MESSAGES.NETWORK_ERROR,
          duration: 5000
        });
      }
      
      // Set mock data for demo
      setMockMembers();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const setMockMembers = () => {
    const mockMembers = [
      {
        _id: '1',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        joiningDate: '2024-01-15',
        planDuration: 6,
        expiryDate: '2024-07-15',
        status: 'active'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane@example.com',
        joiningDate: '2024-02-20',
        planDuration: 3,
        expiryDate: '2024-05-20',
        status: 'expiring'
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        phone: '+1122334455',
        email: 'mike@example.com',
        joiningDate: '2023-12-10',
        planDuration: 3,
        expiryDate: '2024-03-10',
        status: 'expired'
      }
    ];
    setMembers(mockMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await axios.put(`/api/members/${editingMember._id}`, formData);
      } else {
        await axios.post('/api/members', formData);
      }
      
      setShowModal(false);
      setEditingMember(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        joiningDate: '',
        planDuration: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      joiningDate: new Date(member.joiningDate).toISOString().split('T')[0],
      planDuration: member.planDuration.toString()
    });
    setShowModal(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (memberToDelete) {
      try {
        await axios.delete(`/api/members/${memberToDelete._id}`);
        setShowDeleteDialog(false);
        setMemberToDelete(null);
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        badge: 'badge-danger',
        icon: XCircle,
        text: 'Expired',
        color: 'text-danger-600'
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'expiring',
        badge: 'badge-warning',
        icon: AlertTriangle,
        text: `${daysUntilExpiry} days left`,
        color: 'text-warning-600'
      };
    } else {
      return {
        status: 'active',
        badge: 'badge-success',
        icon: CheckCircle,
        text: 'Active',
        color: 'text-success-600'
      };
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
  };

  const filteredAndSortedMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <MembersPageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Members</h1>
            <p className="text-gray-600 mt-1">Manage your gym members and their memberships</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <Filter className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-gradient p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="card-gradient p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </div>
          <div className="card-gradient p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.status === 'expiring').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="input"
                >
                  <option value="joiningDate-desc">Newest First</option>
                  <option value="joiningDate-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="expiryDate-asc">Expiry Soon</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="divide-y divide-gray-100">
                {/* Table Header */}
                <div className="table-header px-6 py-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8"></div>
                    <div className="flex-1">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Member
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-32">Contact</div>
                    <div className="w-24">
                      <button
                        onClick={() => handleSort('joiningDate')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Joined
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-24">
                      <button
                        onClick={() => handleSort('expiryDate')}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Expires
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-20">Status</div>
                    <div className="w-16">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {filteredAndSortedMembers.map((member) => {
                    const expiryInfo = getExpiryStatus(member.expiryDate);
                    const ExpiryIcon = expiryInfo.icon;
                    
                    return (
                      <div key={member._id} className="table-row px-6 py-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                              <span className="text-white font-semibold text-sm">
                                {getInitials(member.name)}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                              member.status === 'active' ? 'bg-success-500' : 
                              member.status === 'expiring' ? 'bg-warning-500' : 
                              'bg-danger-500'
                            }`}></div>
                          </div>

                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 truncate">
                                {member.name}
                              </div>
                              <span className={expiryInfo.badge}>
                                {expiryInfo.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{member.email || 'No email'}</span>
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="w-32">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{member.phone}</span>
                            </div>
                          </div>

                          {/* Joined Date */}
                          <div className="w-24">
                            <div className="text-sm text-gray-900">
                              {formatDate(member.joiningDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.planDuration} month{member.planDuration > 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Expiry Date */}
                          <div className="w-24">
                            <div className={`text-sm ${expiryInfo.color} font-medium`}>
                              {formatDate(member.expiryDate)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <ExpiryIcon className="w-3 h-3" />
                              <span>{expiryInfo.text}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="w-20">
                            <span className={expiryInfo.badge}>
                              {expiryInfo.status}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="w-16">
                            <div className="relative">
                              <button
                                onClick={() => setShowDropdown(showDropdown === member._id ? null : member._id)}
                                className="btn-ghost p-1"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown */}
                              {showDropdown === member._id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-soft-lg border border-gray-200 overflow-hidden z-10">
                                  <button
                                    onClick={() => {
                                      handleEdit(member);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Member
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteClick(member);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Member
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {filteredAndSortedMembers.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters to find what you\'re looking for.'
                      : 'Get started by adding your first gym member.'
                    }
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Your First Member
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-soft-lg transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4 sm:pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingMember ? 'Edit Member' : 'Add New Member'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-ghost p-2"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input"
                        placeholder="Enter member's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="input"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input"
                        placeholder="Enter email address (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Joining Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan Duration *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.planDuration}
                          onChange={(e) => setFormData({...formData, planDuration: e.target.value})}
                          className="input"
                          placeholder="Months"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMember(null);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        joiningDate: '',
                        planDuration: ''
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && memberToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteDialog(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-soft-lg transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
              <div className="bg-white px-6 pt-6 pb-4 sm:pb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-danger-100 rounded-full mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-danger-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Delete Member
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-medium">{memberToDelete.name}</span>? 
                    This action cannot be undone and all member data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="btn-danger flex-1"
                >
                  Delete Member
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setMemberToDelete(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Members;
