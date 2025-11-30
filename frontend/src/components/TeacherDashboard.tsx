import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { setUser, logout, clearError, updateTimer } from '../store/store';
import { socketService } from '../services/socketService';
import PollCreation from './PollCreation';
import ActivePoll from './ActivePoll';
import PollResults from './PollResults';
import StudentsPanel from './StudentsPanel';
import Chat from './Chat';
import PollHistory from './PollHistory';

const TeacherDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, poll, error } = useSelector((state: RootState) => state.app);
  const [teacherName, setTeacherName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    if (user.isAuthenticated && user.role === 'teacher') {
      setShowNameModal(false);
      socketService.connect();
      socketService.joinSession(user.name, 'teacher');
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (poll.activePoll && poll.timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch(updateTimer(poll.timeRemaining - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [poll.activePoll, poll.timeRemaining, dispatch]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherName.trim()) {
      dispatch(setUser({ name: teacherName.trim(), role: 'teacher' }));
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate('/');
  };

  if (showNameModal) {
    return (
      <div className="name-modal">
        <div className="name-modal-content">
          <h2>Enter Your Name</h2>
          <p>Please enter your name to start the polling session as a teacher.</p>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
              required
              autoFocus
            />
            <button type="submit" className="name-submit-btn">
              Start Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Teacher Dashboard</h1>
        <div className="user-info">
          <span className="user-name">👨‍🏫 {user.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error">
          {error}
          <button 
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <main className="main-content">
          {!poll.activePoll && <PollCreation />}
          {poll.activePoll && <ActivePoll />}
          <PollResults />
          <PollHistory />
        </main>
        
        <aside className="sidebar">
          <StudentsPanel />
          <Chat />
        </aside>
      </div>
    </div>
  );
};

export default TeacherDashboard;