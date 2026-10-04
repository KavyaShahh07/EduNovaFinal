import React from 'react';
import { EduNovaPixelPerfectDashboard } from '../../components/dashboard/EduNovaPixelPerfectDashboard';

export const StudentDashboardPage = ({ track }) => {
  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <EduNovaPixelPerfectDashboard initialTrackProp={track} />
    </div>
  );
};

export default StudentDashboardPage;

