import React, { useEffect, useMemo, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context-store/AuthContext';
import { identityService } from '../../services/api';

const ManageCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      setErrorMessage('Admin token is required to load customers.');
      return;
    }

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await fetch(`${identityService.apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || data.message || 'Failed to load customers.');
          setCustomers([]);
          return;
        }

        setCustomers(data.filter((account) => account.role === 'customer'));
      } catch (error) {
        console.error('Load customers error:', error);
        setErrorMessage('Failed to reach identity service.');
      } finally {
        setLoading(false);
      }
    };

    void loadCustomers();
  }, [user?.token]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) =>
      `${customer.full_name} ${customer.email} ${customer.phone || ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [customers, searchTerm]);

  return (
    <div className="booking-tour-container">
      <h2>Customer Management</h2>

      <div className="partner-filter">
        <input
          type="text"
          placeholder="Find by name, email, phone..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? <p>Loading customers...</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}

      {!loading && !errorMessage ? (
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.user_id}>
                  <td>{customer.user_id}</td>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default ManageCustomers;
