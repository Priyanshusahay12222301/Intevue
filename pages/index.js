import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from '../frontend/src/store/store';
import LandingPage from '../frontend/src/components/LandingPage';
import TeacherDashboard from '../frontend/src/components/TeacherDashboard';
import StudentDashboard from '../frontend/src/components/StudentDashboard';
import '../frontend/src/App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;