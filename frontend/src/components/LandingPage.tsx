import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>Live Polling System</h1>
        <p>Real-time interactive polling for classrooms and meetings</p>
        
        <div className="role-buttons">
          <Link to="/teacher" className="role-button teacher-btn">
            👨‍🏫 Teacher
          </Link>
          <Link to="/student" className="role-button student-btn">
            👨‍🎓 Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;