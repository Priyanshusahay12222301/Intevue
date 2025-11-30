import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const PollHistory: React.FC = () => {
  const { pollHistory } = useSelector((state: RootState) => state.app);

  if (pollHistory.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="poll-history">
      <h3>Poll History</h3>
      {pollHistory.map((item, index) => {
        const totalVotes = Object.values(item.results).reduce((sum, count) => sum + count, 0);
        
        return (
          <div key={index} className="history-item">
            <div className="history-question">{item.poll.question}</div>
            <div className="history-meta">
              {formatDate(item.endedAt)} • {totalVotes} responses
            </div>
            <div className="history-results">
              {Object.entries(item.results).map(([option, count]) => {
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                
                return (
                  <div key={option} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '4px 0',
                    fontSize: '0.9rem'
                  }}>
                    <span>{option}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PollHistory;