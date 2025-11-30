const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Debug logging for deployment
console.log('__dirname:', __dirname);
console.log('Process cwd:', process.cwd());
const buildPath = path.join(__dirname, 'frontend/build');
const indexPath = path.join(buildPath, 'index.html');
console.log('Build path:', buildPath);
console.log('Index path:', indexPath);
console.log('Build path exists:', fs.existsSync(buildPath));
console.log('Index.html exists:', fs.existsSync(indexPath));

// Serve static files from React build
app.use(express.static(buildPath));
console.log('Serving static files from:', buildPath);

// Store active polls and connected users
let activePoll = null;
let connectedUsers = new Map();
let pollResults = new Map();
let pollHistory = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Polling System Backend is running!' });
});

app.get('/api/active-poll', (req, res) => {
  res.json({ poll: activePoll, results: Object.fromEntries(pollResults) });
});

app.get('/api/poll-history', (req, res) => {
  res.json({ history: pollHistory });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (data) => {
    const { name, role } = data;
    connectedUsers.set(socket.id, { 
      name, 
      role, 
      answered: false,
      joinedAt: new Date()
    });
    
    console.log(`${role} ${name} joined`);
    
    // Send current poll state to the new user
    socket.emit('poll-state', {
      activePoll,
      results: Object.fromEntries(pollResults),
      connectedUsers: Array.from(connectedUsers.values()),
      hasAnswered: false
    });
    
    // Broadcast updated user list to all clients
    io.emit('users-updated', Array.from(connectedUsers.values()));
  });

  // Handle poll creation (Teacher only)
  socket.on('create-poll', async (pollData) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user || user.role !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can create polls' });
      return;
    }

    // Check if all students have answered or no poll exists
    const studentsCount = Array.from(connectedUsers.values()).filter(u => u.role === 'student').length;
    const answeredCount = Array.from(connectedUsers.values()).filter(u => u.role === 'student' && u.answered).length;
    
    if (activePoll && studentsCount > 0 && answeredCount < studentsCount) {
      socket.emit('error', { message: 'Cannot create new poll. Not all students have answered the current question.' });
      return;
    }

    // Create new poll
    activePoll = {
      id: Date.now().toString(),
      question: pollData.question,
      options: pollData.options,
      timeLimit: pollData.timeLimit || 60,
      createdAt: new Date(),
      createdBy: user.name
    };

    // Reset poll results and user answers
    pollResults.clear();
    pollData.options.forEach(option => {
      pollResults.set(option, 0);
    });

    // Reset answered status for all users
    connectedUsers.forEach((userData, socketId) => {
      userData.answered = false;
    });

    console.log('New poll created:', activePoll.question);

    // Broadcast new poll to all clients
    io.emit('new-poll', {
      poll: activePoll,
      results: Object.fromEntries(pollResults)
    });

    // Start poll timer
    setTimeout(() => {
      if (activePoll && activePoll.id === pollData.id) {
        endPoll();
      }
    }, activePoll.timeLimit * 1000);
  });

  // Handle poll answer (Student only)
  socket.on('submit-answer', (data) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user || user.role !== 'student') {
      socket.emit('error', { message: 'Only students can submit answers' });
      return;
    }

    if (!activePoll) {
      socket.emit('error', { message: 'No active poll to answer' });
      return;
    }

    if (user.answered) {
      socket.emit('error', { message: 'You have already answered this poll' });
      return;
    }

    // Record the answer
    const { selectedOption } = data;
    
    if (!pollResults.has(selectedOption)) {
      socket.emit('error', { message: 'Invalid option selected' });
      return;
    }

    pollResults.set(selectedOption, pollResults.get(selectedOption) + 1);
    user.answered = true;

    console.log(`${user.name} answered: ${selectedOption}`);

    // Broadcast updated results
    io.emit('poll-results-updated', {
      results: Object.fromEntries(pollResults),
      totalAnswers: Array.from(connectedUsers.values()).filter(u => u.role === 'student' && u.answered).length,
      totalStudents: Array.from(connectedUsers.values()).filter(u => u.role === 'student').length
    });

    // Check if all students have answered
    const students = Array.from(connectedUsers.values()).filter(u => u.role === 'student');
    const answeredStudents = students.filter(s => s.answered);
    
    if (students.length > 0 && answeredStudents.length === students.length) {
      setTimeout(() => endPoll(), 1000);
    }
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    const message = {
      id: Date.now().toString(),
      sender: user.name,
      role: user.role,
      message: data.message,
      timestamp: new Date()
    };

    // Broadcast message to all clients
    io.emit('new-message', message);
  });

  // Handle remove student (Teacher only)
  socket.on('remove-student', (data) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user || user.role !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can remove students' });
      return;
    }

    const { studentName } = data;
    let removedSocketId = null;

    connectedUsers.forEach((userData, socketId) => {
      if (userData.name === studentName && userData.role === 'student') {
        removedSocketId = socketId;
      }
    });

    if (removedSocketId) {
      connectedUsers.delete(removedSocketId);
      io.to(removedSocketId).emit('removed-by-teacher');
      io.to(removedSocketId).disconnect();
      
      // Update user list
      io.emit('users-updated', Array.from(connectedUsers.values()));
      
      console.log(`Student ${studentName} removed by teacher`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.role} ${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      
      // Broadcast updated user list
      io.emit('users-updated', Array.from(connectedUsers.values()));
    }
  });
});

function endPoll() {
  if (activePoll) {
    // Save to history
    const pollData = {
      ...activePoll,
      results: Object.fromEntries(pollResults),
      endedAt: new Date(),
      totalAnswers: Array.from(connectedUsers.values()).filter(u => u.role === 'student' && u.answered).length,
      totalStudents: Array.from(connectedUsers.values()).filter(u => u.role === 'student').length
    };
    
    pollHistory.push(pollData);
    
    // Broadcast poll ended
    io.emit('poll-ended', {
      poll: activePoll,
      results: Object.fromEntries(pollResults)
    });

    console.log('Poll ended:', activePoll.question);
    activePoll = null;
  }
}

// All other routes serve the React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend/build', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});