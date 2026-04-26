import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Admin.css';
import { Navigate ,Outlet} from 'react-router-dom';
import { useAuth } from '../../context-store/AuthContext';
const AdminLayout = () => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  

  return (
   <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

