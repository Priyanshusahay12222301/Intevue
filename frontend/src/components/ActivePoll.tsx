import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ActivePoll: React.FC = () => {
  const { poll, user } = useSelector((state: RootState) => state.app);

  if (!poll.activePoll) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="active-poll">
      <h2>Active Poll</h2>
      <div className="poll-question">{poll.activePoll.question}</div>
      
      <div className="poll-timer">
        ⏱️ Time Remaining: {formatTime(poll.timeRemaining)}
      </div>

      <div className="poll-options">
        {poll.activePoll.options.map((option, index) => {
          const voteCount = poll.results[option] || 0;
          const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <div key={index} className="poll-option disabled">
              <span className="option-text">{option}</span>
              <div className="option-votes">
                {voteCount} votes ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>

      {user.role === 'teacher' && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#666' }}>
            👀 You're viewing the live poll as a teacher. Students can see this question and submit their answers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivePoll;