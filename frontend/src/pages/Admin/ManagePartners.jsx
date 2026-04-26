import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context-store/AuthContext';
import { identityService } from '../../services/api';

const matchesApprovalFilter = (approvalFilter, approved) => {
  if (!approvalFilter) {
    return true;
  }

  if (approvalFilter === 'approved') {
    return Boolean(approved);
  }

  return !approved;
};

const ManagePartners = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const loadPartners = async () => {
      if (!user?.token) {
        setLoading(false);
        setErrorMessage('Admin token is required to load partners.');
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');

        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const [partnersResponse, usersResponse] = await Promise.all([
          fetch(`${identityService.apiUrl}/partners`, { headers }),
          fetch(`${identityService.apiUrl}/users`, { headers }),
        ]);

        const partnersData = await partnersResponse.json();
        const usersData = await usersResponse.json();

        if (!partnersResponse.ok) {
          setErrorMessage(partnersData.error || partnersData.message || 'Failed to load partners.');
          setPartners([]);
          return;
        }

        if (!usersResponse.ok) {
          setErrorMessage(usersData.error || usersData.message || 'Failed to load users.');
          setPartners([]);
          return;
        }

        const usersById = new Map(usersData.map((account) => [account.user_id, account]));

        setPartners(
          partnersData.map((partner) => {
            const account = usersById.get(partner.user_id) || {};

            return {
              ...partner,
              full_name: account.full_name || `User #${partner.user_id}`,
              email: account.email || 'N/A',
              phone: account.phone || 'N/A',
            };
          })
        );
      } catch (error) {
        console.error('Load partners error:', error);
        setErrorMessage('Failed to reach identity service.');
      } finally {
        setLoading(false);
      }
    };

    void loadPartners();
  }, [user?.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = `${partner.full_name} ${partner.email} ${partner.company_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesApproval = matchesApprovalFilter(approvalFilter, partner.approved);

      return matchesSearch && matchesApproval;
    });
  }, [approvalFilter, partners, searchTerm]);

  const updatePartnerApproval = async (partner_id, approved) => {
    try {
      const response = await fetch(`${identityService.apiUrl}/partners/${partner_id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ approved }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || 'Failed to update partner status.');
        return;
      }

      setPartners((currentPartners) =>
        currentPartners.map((partner) =>
          partner.partner_id === partner_id ? { ...partner, approved } : partner
        )
      );
      setOpenId(null);
    } catch (error) {
      console.error('Update partner approval error:', error);
      alert('Failed to reach identity service.');
    }
  };

  const deletePartner = async (partner_id) => {
    if (!globalThis.confirm('Are you sure you want to delete this partner application?')) {
      return;
    }

    try {
      const response = await fetch(`${identityService.apiUrl}/partners/${partner_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || 'Failed to delete partner.');
        return;
      }

      setPartners((currentPartners) => currentPartners.filter((partner) => partner.partner_id !== partner_id));
      setOpenId(null);
    } catch (error) {
      console.error('Delete partner error:', error);
      alert('Failed to reach identity service.');
    }
  };

  return (
    <div className="booking-tour-container">
      <h2>Partner Management</h2>

      <div className="partner-filter">
        <input
          type="text"
          placeholder="Find by name, email, company..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? <p>Loading partners...</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}

      {!loading && !errorMessage ? (
        <table className="booking-table">
          <thead>
            <tr>
              <th>Partner ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan="8">No partners found.</td>
              </tr>
            ) : (
              filteredPartners.map((partner) => (
                <tr key={partner.partner_id}>
                  <td>{partner.partner_id}</td>
                  <td>{partner.full_name}</td>
                  <td>{partner.email}</td>
                  <td>{partner.phone}</td>
                  <td>{partner.company_name || 'N/A'}</td>
                  <td>{partner.address || 'N/A'}</td>
                  <td>{partner.approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    <div className="action-menu" ref={openId === partner.partner_id ? menuRef : null}>
                      <button
                        type="button"
                        className="menu-toggle"
                        onClick={() => setOpenId(openId === partner.partner_id ? null : partner.partner_id)}
                        aria-haspopup="menu"
                        aria-expanded={openId === partner.partner_id}
                      >
                        ⋮
                      </button>
                      {openId === partner.partner_id && (
                        <div className="menu-dropdown" role="menu">
                          <button
                            type="button"
                            className="menu-dropdown-item"
                            onClick={() => updatePartnerApproval(partner.partner_id, !partner.approved)}
                          >
                            {partner.approved ? 'Mark Pending' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="menu-dropdown-item"
                            onClick={() => deletePartner(partner.partner_id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default ManagePartners;
