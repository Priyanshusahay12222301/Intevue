import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Poll, PollResults, User, ChatMessage, PollHistory } from '../types';

interface AppState {
  user: {
    name: string;
    role: 'teacher' | 'student' | null;
    isAuthenticated: boolean;
  };
  poll: {
    activePoll: Poll | null;
    results: PollResults;
    selectedOption: string | null;
    hasAnswered: boolean;
    timeRemaining: number;
    isLoading: boolean;
  };
  users: User[];
  chat: {
    messages: ChatMessage[];
    isOpen: boolean;
  };
  pollHistory: PollHistory[];
  error: string | null;
}

const initialState: AppState = {
  user: {
    name: '',
    role: null,
    isAuthenticated: false,
  },
  poll: {
    activePoll: null,
    results: {},
    selectedOption: null,
    hasAnswered: false,
    timeRemaining: 0,
    isLoading: false,
  },
  users: [],
  chat: {
    messages: [],
    isOpen: false,
  },
  pollHistory: [],
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // User actions
    setUser: (state, action: PayloadAction<{ name: string; role: 'teacher' | 'student' }>) => {
      state.user.name = action.payload.name;
      state.user.role = action.payload.role;
      state.user.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = {
        name: '',
        role: null,
        isAuthenticated: false,
      };
      state.poll = initialState.poll;
      state.users = [];
      state.chat.messages = [];
    },

    // Poll actions
    setPollState: (state, action: PayloadAction<{
      activePoll: Poll | null;
      results: PollResults;
      hasAnswered: boolean;
    }>) => {
      state.poll.activePoll = action.payload.activePoll;
      state.poll.results = action.payload.results;
      state.poll.hasAnswered = action.payload.hasAnswered;
      state.poll.timeRemaining = action.payload.activePoll?.timeLimit || 0;
      state.poll.isLoading = false;
    },
    setNewPoll: (state, action: PayloadAction<{
      poll: Poll;
      results: PollResults;
    }>) => {
      state.poll.activePoll = action.payload.poll;
      state.poll.results = action.payload.results;
      state.poll.hasAnswered = false;
      state.poll.selectedOption = null;
      state.poll.timeRemaining = action.payload.poll.timeLimit;
      state.poll.isLoading = false;
    },
    updatePollResults: (state, action: PayloadAction<{
      results: PollResults;
      totalAnswers: number;
      totalStudents: number;
    }>) => {
      state.poll.results = action.payload.results;
    },
    endPoll: (state, action: PayloadAction<{
      poll: Poll;
      results: PollResults;
    }>) => {
      // Add to history
      if (action.payload.poll) {
        const historyItem: PollHistory = {
          poll: action.payload.poll,
          results: action.payload.results,
          totalAnswers: Object.values(action.payload.results).reduce((sum, count) => sum + count, 0),
          totalStudents: state.users.filter(u => u.role === 'student').length,
          endedAt: new Date(),
        };
        state.pollHistory.unshift(historyItem);
      }
      state.poll.activePoll = null;
      state.poll.timeRemaining = 0;
    },
    selectOption: (state, action: PayloadAction<string>) => {
      state.poll.selectedOption = action.payload;
    },
    submitAnswer: (state) => {
      state.poll.hasAnswered = true;
      state.poll.isLoading = true;
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      state.poll.timeRemaining = action.payload;
    },
    setPollLoading: (state, action: PayloadAction<boolean>) => {
      state.poll.isLoading = action.payload;
    },

    // Users actions
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },

    // Chat actions
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chat.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.chat.isOpen = !state.chat.isOpen;
    },
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.chat.isOpen = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Poll History
    setPollHistory: (state, action: PayloadAction<PollHistory[]>) => {
      state.pollHistory = action.payload;
    },
  },
});

export const {
  setUser,
  logout,
  setPollState,
  setNewPoll,
  updatePollResults,
  endPoll,
  selectOption,
  submitAnswer,
  updateTimer,
  setPollLoading,
  setUsers,
  addMessage,
  toggleChat,
  setChatOpen,
  setError,
  clearError,
  setPollHistory,
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'app/setPollState',
          'app/setNewPoll',
          'app/endPoll',
          'app/addMessage',
          'app/setPollHistory',
        ],
        ignoredPaths: [
          'app.poll.activePoll.createdAt',
          'app.users.joinedAt',
          'app.chat.messages.timestamp',
          'app.pollHistory.poll.createdAt',
          'app.pollHistory.endedAt',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;