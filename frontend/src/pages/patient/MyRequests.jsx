import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Ambulance,
  MapPin,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useEmergencyStore from '../../store/emergencyStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyRequests = () => {
  const navigate = useNavigate();
  const { getMyRequests, myRequests, loading } = useEmergencyStore();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [filter, page]);

  const fetchRequests = async () => {
    const params = {
      page,
      limit: 10,
    };

    if (filter !== 'all') {
      params.status = filter;
    }

    await getMyRequests(params);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending' },
      searching: { color: 'blue', text: 'Searching' },
      accepted: { color: 'green', text: 'Accepted' },
      en_route_to_pickup: { color: 'blue', text: 'On the Way' },
      arrived_at_pickup: { color: 'purple', text: 'Arrived' },
      patient_picked: { color: 'indigo', text: 'Patient Picked' },
      en_route_to_hospital: { color: 'blue', text: 'To Hospital' },
      arrived_at_hospital: { color: 'green', text: 'At Hospital' },
      completed: { color: 'gray', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
      no_ambulance_available: { color: 'red', text: 'No Ambulance' },
    };

    const config = statusConfig[status] || { color: 'gray', text: status };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}
      >
        {config.text}
      </span>
    );
  };

  const getServiceTypeBadge = (type) => {
    return type === 'emergency' ? (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
        Emergency
      </span>
    ) : (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
        Private
      </span>
    );
  };

  const filteredRequests = myRequests.filter(
    (request) =>
      request.emergencyType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.pickupLocation.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">
            View your emergency and booking history
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by type or location..."
                className="input-field pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {['all', 'completed', 'cancelled', 'active'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    filter === status
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <Ambulance className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Requests Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'No requests match your search'
                : filter === 'all'
                ? "You haven't made any requests yet"
                : `No ${filter} requests found`}
            </p>
            <button
              onClick={() => navigate('/emergency')}
              className="btn-primary"
            >
              Request Emergency Ambulance
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (
                    [
                      'accepted',
                      'en_route_to_pickup',
                      'arrived_at_pickup',
                      'patient_picked',
                      'en_route_to_hospital',
                    ].includes(request.status)
                  ) {
                    navigate(`/track/${request._id}`);
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        request.serviceType === 'emergency'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {request.serviceType === 'emergency' ? (
                        <Phone className="w-6 h-6 text-red-600" />
                      ) : (
                        <Ambulance className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {request.emergencyType
                            .replace('_', ' ')
                            .toUpperCase()}
                        </h3>
                        {getServiceTypeBadge(request.serviceType)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(request.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {request.pickupLocation.address}
                  </span>
                </div>

                {/* Ambulance Info */}
                {request.assignedAmbulanceId && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Ambulance className="w-4 h-4" />
                        <span>
                          {
                            request.assignedAmbulanceId.registrationNumber
                          }{' '}
                          ({request.assignedAmbulanceId.type})
                        </span>
                      </div>
                      {request.assignedAmbulanceId.driverId && (
                        <a
                          href={`tel:${request.assignedAmbulanceId.driverId.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Driver</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Fare Info (for private) */}
                {request.serviceType === 'private' && request.fare > 0 && (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Fare</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{request.fare}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions for completed */}
                {request.status === 'completed' && !request.rating && (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Rating feature coming soon');
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Rate Service →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredRequests.length < 10}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
