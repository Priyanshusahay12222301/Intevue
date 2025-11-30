import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setPollLoading } from '../store/store';
import { socketService } from '../services/socketService';

const PollCreation: React.FC = () => {
  const dispatch = useDispatch();
  const { users, poll } = useSelector((state: RootState) => state.app);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return;

    // Check if there are students connected
    const studentsCount = users.filter(u => u.role === 'student').length;
    if (studentsCount === 0) {
      alert('No students connected. Please wait for students to join before creating a poll.');
      return;
    }

    dispatch(setPollLoading(true));
    
    socketService.createPoll({
      question: question.trim(),
      options: validOptions,
      timeLimit
    });

    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
  };

  const isFormValid = question.trim() !== '' && options.filter(opt => opt.trim() !== '').length >= 2;

  return (
    <div className="poll-creation">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Question *</label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Options * (minimum 2, maximum 6)</label>
          <div className="options-container">
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="form-input"
                  required={index < 2}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-option-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="add-option-btn"
              >
                + Add Option
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="timeLimit">Time Limit</label>
          <div className="time-limit-container">
            <input
              id="timeLimit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Math.max(10, Math.min(300, parseInt(e.target.value) || 60)))}
              min="10"
              max="300"
              className="form-input time-input"
            />
            <span>seconds</span>
          </div>
        </div>

        <button
          type="submit"
          className="create-poll-btn"
          disabled={!isFormValid || poll.isLoading}
        >
          {poll.isLoading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
};

export default PollCreation;