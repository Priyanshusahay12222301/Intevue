import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { 
  setUser, 
  logout, 
  clearError, 
  selectOption, 
  submitAnswer, 
  updateTimer 
} from '../store/store';
import { socketService } from '../services/socketService';
import ActivePoll from './ActivePoll';
import PollResults from './PollResults';
import StudentsPanel from './StudentsPanel';
import Chat from './Chat';

const StudentDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, poll, error } = useSelector((state: RootState) => state.app);
  const [studentName, setStudentName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);

  useEffect(() => {
    if (user.isAuthenticated && user.role === 'student') {
      setShowNameModal(false);
      socketService.connect();
      socketService.joinSession(user.name, 'student');
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
    if (studentName.trim()) {
      dispatch(setUser({ name: studentName.trim(), role: 'student' }));
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!poll.hasAnswered && poll.activePoll) {
      dispatch(selectOption(option));
    }
  };

  const handleSubmitAnswer = () => {
    if (poll.selectedOption && !poll.hasAnswered) {
      dispatch(submitAnswer());
      socketService.submitAnswer(poll.selectedOption);
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showNameModal) {
    return (
      <div className="name-modal">
        <div className="name-modal-content">
          <h2>Enter Your Name</h2>
          <p>Please enter your name to join the polling session as a student.</p>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
              required
              autoFocus
            />
            <button type="submit" className="name-submit-btn">
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Student Dashboard</h1>
        <div className="user-info">
          <span className="user-name">👨‍🎓 {user.name}</span>
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
          {!poll.activePoll && !poll.hasAnswered && (
            <div className="active-poll">
              <h2>Waiting for Poll</h2>
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                🎯 Waiting for the teacher to create a new poll question...
              </p>
            </div>
          )}

          {poll.activePoll && !poll.hasAnswered && (
            <div className="active-poll">
              <h2>Answer the Poll</h2>
              <div className="poll-question">{poll.activePoll.question}</div>
              
              <div className="poll-timer">
                ⏱️ Time Remaining: {formatTime(poll.timeRemaining)}
              </div>

              <div className="poll-options">
                {poll.activePoll.options.map((option, index) => (
                  <div
                    key={index}
                    className={`poll-option ${poll.selectedOption === option ? 'selected' : ''} ${
                      poll.timeRemaining <= 0 ? 'disabled' : ''
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <span className="option-text">{option}</span>
                    {poll.selectedOption === option && <span>✓</span>}
                  </div>
                ))}
              </div>

              {poll.selectedOption && poll.timeRemaining > 0 && (
                <button
                  onClick={handleSubmitAnswer}
                  className="submit-answer-btn"
                  disabled={poll.isLoading}
                >
                  {poll.isLoading ? 'Submitting...' : 'Submit Answer'}
                </button>
              )}
            </div>
          )}

          {(poll.hasAnswered || poll.timeRemaining <= 0) && <PollResults />}
        </main>
        
        <aside className="sidebar">
          <StudentsPanel />
          <Chat />
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;