import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import AddMember from '../pages/AddMember';
import Payments from '../pages/Payments';
import AddPayment from '../pages/AddPayment';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<DashboardLayout />}>  
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='members' element={<Members />} />
          <Route path='members/add' element={<AddMember />} />
          <Route path='payments' element={<Payments />} />
          <Route path='payments/add' element={<AddPayment />} />
          <Route path='reports' element={<Reports />} />
          <Route path='settings' element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
