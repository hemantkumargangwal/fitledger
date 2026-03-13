import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter, Users, Calendar, Phone, Mail, MoreVertical, ChevronDown, UserPlus, AlertTriangle, Clock, CheckCircle, XCircle, ArrowUpDown, RefreshCw, User } from 'lucide-react';
import { MembersPageSkeleton } from '../components/SkeletonLoader';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
// import Alert from '../components/Alert'; // Not used
import { memberService } from '../services/memberService';
// import { formatDate, getInitials } from '../utils/formatters'; // Unused custom imports; local ones in use
import { ERROR_MESSAGES } from '../utils/constants';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
    // eslint-disable-next-line
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

      setMembers(response && response.members ? response.members : []);
      setTotalPages(response && typeof response.totalPages === 'number' ? response.totalPages : 1);

      // Show success toast if available
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Members Loaded',
          message: `Loaded ${response.members?.length || 0} members successfully`,
          duration: 3000
        });
      }
    } catch (e) {
      console.error('Error fetching members:', e);
      setError(ERROR_MESSAGES && ERROR_MESSAGES.NETWORK_ERROR ? ERROR_MESSAGES.NETWORK_ERROR : "Error fetching members");
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading Error',
          message: ERROR_MESSAGES.NETWORK_ERROR,
          duration: 5000
        });
      }
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
    setTotalPages(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const err = {};
    if (!formData.name?.trim()) err.name = 'Name is required';
    if (!formData.phone?.trim()) err.phone = 'Phone is required';
    const duration = Number(formData.planDuration);
    if (!formData.planDuration || isNaN(duration) || duration < 1) err.planDuration = 'Plan duration must be at least 1 month';
    if (Object.keys(err).length) {
      setFormErrors(err);
      return;
    }
    setSubmitLoading(true);
    try {
      if (editingMember) {
        await memberService.updateMember(editingMember._id, {
          ...formData,
          planDuration: Number(formData.planDuration)
        });
      } else {
        await memberService.createMember({
          ...formData,
          planDuration: Number(formData.planDuration)
        });
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
      if (window.toast) {
        window.toast({
          type: 'success',
          title: editingMember ? 'Member updated' : 'Member added',
          message: editingMember ? 'Member details saved successfully.' : 'New member added successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error saving member:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Save failed',
          message: 'Failed to save member. Please try again.',
          duration: 3500
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '',
      planDuration: member.planDuration ? String(member.planDuration) : ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setDeleteLoading(true);
    try {
      await memberService.deleteMember(memberToDelete._id);
      setShowDeleteDialog(false);
      setMemberToDelete(null);
      fetchMembers();
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Member deleted',
          message: 'Member has been removed successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Delete failed',
          message: 'Failed to delete member. Please try again.',
          duration: 3500
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Use local formatDate and getInitials for self-contained
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return {
        status: 'expired',
        badge: 'badge-danger',
        icon: XCircle,
        text: 'Expired',
        color: 'text-danger-600'
      };
    }
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (isNaN(daysUntilExpiry)) {
      return {
        status: 'expired',
        badge: 'badge-danger',
        icon: XCircle,
        text: 'Expired',
        color: 'text-danger-600'
      };
    }
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
    if (!name || typeof name !== 'string') return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Clear search and statusFilter check for undefined members
  const filteredAndSortedMembers = Array.isArray(members) ? members
    .filter(member => {
      if (!member) return false;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        member.name?.toLowerCase().includes(term) ||
        (member.phone && member.phone.includes(term)) ||
        (member.email && member.email.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    // Sort as per selection
    .sort((a, b) => {
      let aField, bField;
      if (sortBy === 'name') {
        aField = (a.name || '').toLowerCase();
        bField = (b.name || '').toLowerCase();
      } else if (sortBy === 'joiningDate') {
        aField = new Date(a.joiningDate);
        bField = new Date(b.joiningDate);
      } else if (sortBy === 'expiryDate') {
        aField = new Date(a.expiryDate);
        bField = new Date(b.expiryDate);
      } else {
        aField = '';
        bField = '';
      }
      if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
      if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    })
    :
    [];

  // Correct page calculation for filtered members
  const itemsPerPage = 10;
  const totalFiltered = filteredAndSortedMembers.length;
  const paginatedMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // if currentPage is out of range after filtering, reset to 1
    if (currentPage > Math.ceil(totalFiltered / itemsPerPage) && totalFiltered > 0) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line
  }, [totalFiltered]);

  // Correct calculation of shown items in pagination ("Showing x to y of z members")
  const fromIdx = totalFiltered === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const toIdx = Math.min(currentPage * itemsPerPage, totalFiltered);

  if (loading) {
    return <MembersPageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Members</h1>
            <p className="text-gray-600 mt-1">Manage your gym members and their memberships</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" type="button" tabIndex={-1}>
              <Filter className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              type="button"
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
                  <option value="expiryDate-desc">Expiry Far</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Members Table - CSS Grid for exact column alignment */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {paginatedMembers.length > 0 && (
            <div
              className="min-w-[700px] grid gap-x-4 px-6 py-4 border-b border-gray-200 bg-gray-50/80"
              style={{ gridTemplateColumns: '32px minmax(160px, 1fr) 110px 95px 95px 72px 48px' }}
            >
              {/* Header row - direct grid children */}
              <div aria-hidden />
              <div>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  type="button"
                >
                  Member
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</div>
              <div>
                <button
                  onClick={() => handleSort('joiningDate')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  type="button"
                >
                  Joined
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleSort('expiryDate')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  type="button"
                >
                  Expires
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
            </div>
            )}

            {/* Body rows - each row is a grid with same template */}
            {paginatedMembers.map((member) => {
              const expiryInfo = getExpiryStatus(member.expiryDate);
              const ExpiryIcon = expiryInfo.icon;
              return (
                <div
                  key={member._id}
                  className="min-w-[700px] grid gap-x-4 px-6 py-4 items-center border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  style={{ gridTemplateColumns: '32px minmax(160px, 1fr) 110px 95px 95px 72px 48px' }}
                >
                  <div aria-hidden />
                  {/* Member */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-semibold text-sm shadow-sm">
                        {getInitials(member.name)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          expiryInfo.status === 'active' ? 'bg-emerald-500' :
                          expiryInfo.status === 'expiring' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        title={expiryInfo.status}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{member.name}</div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{member.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                  {/* Contact */}
                  <div className="text-sm text-gray-900 truncate" title={member.phone}>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      {member.phone}
                    </span>
                  </div>
                  {/* Joined */}
                  <div>
                    <div className="text-sm text-gray-900">{formatDate(member.joiningDate)}</div>
                    <div className="text-xs text-gray-500">
                      {member.planDuration} month{Number(member.planDuration) > 1 ? 's' : ''}
                    </div>
                  </div>
                  {/* Expires */}
                  <div>
                    <div className={`text-sm font-medium ${expiryInfo.color}`}>
                      {formatDate(member.expiryDate)}
                    </div>
                    <div className="text-xs text-gray-500" title={expiryInfo.text}>
                      <ExpiryIcon className="w-3 h-3 inline" />
                    </div>
                  </div>
                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        expiryInfo.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        expiryInfo.status === 'expiring' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {expiryInfo.status}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(showDropdown === member._id ? null : member._id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-expanded={showDropdown === member._id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showDropdown === member._id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          aria-hidden="true"
                          onClick={() => setShowDropdown(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100]">
                          <Link
                            to={`/members/${member._id}`}
                            onClick={() => setShowDropdown(null)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            <User className="w-4 h-4 shrink-0" />
                            View Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => { handleEdit(member); setShowDropdown(null); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            <Edit className="w-4 h-4 shrink-0" />
                            Edit Member
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleDeleteClick(member); setShowDropdown(null); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            Delete Member
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {paginatedMembers.length === 0 && (
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
                    type="button"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Your First Member
                  </button>
                </div>
              )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {fromIdx} to {toIdx} of {totalFiltered} members
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(5, totalPages)
                  }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
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
                    {Object.keys(formErrors).length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
                        Please fix the errors below.
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => { setFormData({...formData, name: e.target.value}); setFormErrors((prev) => ({ ...prev, name: undefined })); }}
                        className={`input ${formErrors.name ? 'input-error border-red-500' : ''}`}
                        placeholder="Enter member's full name"
                        autoFocus
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => { setFormData({...formData, phone: e.target.value}); setFormErrors((prev) => ({ ...prev, phone: undefined })); }}
                        className={`input ${formErrors.phone ? 'input-error border-red-500' : ''}`}
                        placeholder="Enter phone number"
                      />
                      {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
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
                          onChange={(e) => { setFormData({...formData, planDuration: e.target.value}); setFormErrors((prev) => ({ ...prev, planDuration: undefined })); }}
                          className={`input ${formErrors.planDuration ? 'input-error border-red-500' : ''}`}
                          placeholder="Months"
                        />
                        {formErrors.planDuration && <p className="mt-1 text-xs text-red-600">{formErrors.planDuration}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                  >
                    {submitLoading && <Spinner className="w-4 h-4" />}
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

        <ConfirmDialog
          open={showDeleteDialog && !!memberToDelete}
          title="Delete member"
          message={
            memberToDelete ? (
              <>
                Are you sure you want to delete <strong>{memberToDelete.name}</strong>? This action cannot be undone.
              </>
            ) : null
          }
          confirmLabel="Delete member"
          cancelLabel="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setMemberToDelete(null);
          }}
        />
    </div>
  );
};

export default Members;
