import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const PollResults: React.FC = () => {
  const { poll } = useSelector((state: RootState) => state.app);

  if (!poll.activePoll && Object.keys(poll.results).length === 0) {
    return null;
  }

  const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return (
      <div className="poll-results">
        <div className="results-header">
          <h3 className="results-title">Poll Results</h3>
          <span className="total-responses">0 responses</span>
        </div>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No responses yet. Waiting for students to answer...
        </p>
      </div>
    );
  }

  return (
    <div className="poll-results">
      <div className="results-header">
        <h3 className="results-title">Live Poll Results</h3>
        <span className="total-responses">{totalVotes} responses</span>
      </div>

      <div className="results-list">
        {Object.entries(poll.results).map(([option, count]) => {
          const percentage = Math.round((count / totalVotes) * 100);
          
          return (
            <div key={option} className="result-bar">
              <div 
                className="result-bar-inner" 
                style={{ width: `${Math.max(percentage, 5)}%` }}
              >
                <div className="result-bar-text">
                  <span>{option}</span>
                  <span>{count} ({percentage}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollResults;