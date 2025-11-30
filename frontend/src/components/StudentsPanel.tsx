import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { socketService } from '../services/socketService';

const StudentsPanel: React.FC = () => {
  const { users, user } = useSelector((state: RootState) => state.app);

  const students = users.filter(u => u.role === 'student');

  const handleRemoveStudent = (studentName: string) => {
    if (window.confirm(`Are you sure you want to remove ${studentName}?`)) {
      socketService.removeStudent(studentName);
    }
  };

  return (
    <div className="students-panel">
      <div className="students-header">
        <h3 className="students-title">Connected Students</h3>
        <span className="students-count">{students.length}</span>
      </div>

      {students.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No students connected yet
        </p>
      ) : (
        <div className="student-list">
          {students.map((student) => (
            <div key={student.name} className="student-item">
              <div>
                <div className="student-name">{student.name}</div>
                <div className="student-status">
                  <div 
                    className={`status-indicator ${
                      student.answered ? 'status-answered' : 'status-pending'
                    }`}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {student.answered ? 'Answered' : 'Pending'}
                  </span>
                </div>
              </div>
              
              {user.role === 'teacher' && (
                <button
                  onClick={() => handleRemoveStudent(student.name)}
                  className="remove-student-btn"
                  title={`Remove ${student.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsPanel;