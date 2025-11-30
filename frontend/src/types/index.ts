export interface Poll {
  id: string;
  question: string;
  options: string[];
  timeLimit: number;
  createdAt: Date;
  createdBy: string;
}

export interface PollResults {
  [option: string]: number;
}

export interface User {
  name: string;
  role: 'teacher' | 'student';
  answered: boolean;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'teacher' | 'student';
  message: string;
  timestamp: Date;
}

export interface PollHistory {
  poll: Poll;
  results: PollResults;
  totalAnswers: number;
  totalStudents: number;
  endedAt: Date;
}

export interface SocketEvents {
  // Client to Server
  join: (data: { name: string; role: 'teacher' | 'student' }) => void;
  'create-poll': (pollData: {
    question: string;
    options: string[];
    timeLimit: number;
  }) => void;
  'submit-answer': (data: { selectedOption: string }) => void;
  'send-message': (data: { message: string }) => void;
  'remove-student': (data: { studentName: string }) => void;

  // Server to Client
  'poll-state': (data: {
    activePoll: Poll | null;
    results: PollResults;
    connectedUsers: User[];
    hasAnswered: boolean;
  }) => void;
  'new-poll': (data: {
    poll: Poll;
    results: PollResults;
  }) => void;
  'poll-results-updated': (data: {
    results: PollResults;
    totalAnswers: number;
    totalStudents: number;
  }) => void;
  'poll-ended': (data: {
    poll: Poll;
    results: PollResults;
  }) => void;
  'users-updated': (users: User[]) => void;
  'new-message': (message: ChatMessage) => void;
  'removed-by-teacher': () => void;
  error: (data: { message: string }) => void;
}