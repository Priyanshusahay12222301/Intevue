import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { socketService } from '../services/socketService';

const Chat: React.FC = () => {
  const { chat, user } = useSelector((state: RootState) => state.app);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socketService.sendMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        💬 Chat ({chat.messages.length})
      </div>
      
      <div className="chat-messages">
        {chat.messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          chat.messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <div className="message-sender">
                {msg.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {msg.sender}
                <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#999' }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="message-text">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;