import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

let socket;

const ChatPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [myRooms, setMyRooms] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  // Load chat room
  useEffect(() => {
    setLoading(true);
    api.get(`/chat/${roomId}`)
      .then(res => {
        setRoom(res.data.room);
        setMessages(res.data.room.messages || []);
      })
      .catch(err => {
        toast.error('Chat room not found');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));

    // Load all rooms for sidebar
    api.get('/chat/my-rooms').then(res => setMyRooms(res.data.rooms)).catch(() => {});
  }, [roomId, navigate]);

  // Socket.IO — connect to backend port 5000, not React's port 3000
  useEffect(() => {
    if (!user) return;
    socket = io('http://localhost:5000', { transports: ['websocket', 'polling'], withCredentials: true });

    socket.on('connect', () => {
      socket.emit('join_room', { roomId, userId: user._id });
    });

    socket.on('receive_message', (msg) => {
      // Only add if it's from someone else — our own messages are handled
      // directly via the API response to avoid duplicates
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString() || msg.senderId?.toString();
        if (senderId === user._id.toString()) return prev;
        return [...prev, msg];
      });
      setTypingUser('');
    });

    socket.on('user_typing', ({ userName }) => {
      if (userName !== user.name) setTypingUser(userName);
    });

    socket.on('user_stop_typing', () => setTypingUser(''));

    return () => {
      socket?.emit('leave_room', { roomId });
      socket?.disconnect();
    };
  }, [roomId, user]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const msgText = input.trim();
    const tempId = `temp_${Date.now()}`;
    setInput('');
    setSending(true);

    // Optimistic update — show immediately while API call is in flight
    const tempMsg = {
      _id: tempId,
      message: msgText,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      senderId: user._id,
      senderName: user.name,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    // Emit via socket so the OTHER user sees it in real time
    socket?.emit('send_message', { roomId, message: msgText, senderId: user._id, senderName: user.name, timestamp: new Date() });

    try {
      const res = await api.post(`/chat/${roomId}/message`, { message: msgText });
      const savedMsg = res.data.message;
      // Replace the temp message with the real saved one
      setMessages(prev => prev.map(m => m._id === tempId
        ? { ...savedMsg, sender: { _id: user._id, name: user.name, avatar: user.avatar }, isTemp: false }
        : m
      ));
    } catch (err) {
      toast.error('Failed to send message');
      // Remove the temp message on failure
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, roomId, user, sending]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('typing', { roomId, userName: user.name });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { roomId });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' }}>
      <div className="spinner" />
    </div>
  );

  const isMyMsg = (msg) => {
    const senderId = msg.sender?._id || msg.sender || msg.senderId;
    return senderId?.toString() === user?._id?.toString();
  };

  const otherParty = room ? (room.poster?._id === user?._id ? room.requester : room.poster) : null;

  return (
    <div style={{ height:'calc(100vh - 68px)', display:'flex', background:'var(--cream)' }}>
      {/* Sidebar: room list */}
      <div style={{
        width: sidebarOpen ? 280 : 0, transition:'width 0.3s ease',
        overflow:'hidden', background:'white', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', flexShrink:0,
      }}>
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h4 style={{ fontSize:'0.9rem' }}>💬 My Chats</h4>
          <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--slate)' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {myRooms.length === 0 ? (
            <div style={{ padding:20, textAlign:'center', color:'var(--slate)', fontSize:'0.875rem' }}>No chats yet</div>
          ) : myRooms.map(r => {
            const other = r.poster?._id === user?._id ? r.requester : r.poster;
            const isActive = r.roomId === roomId;
            return (
              <Link key={r.roomId} to={`/chat/${r.roomId}`} style={{
                display:'block', padding:'14px 16px', textDecoration:'none',
                background: isActive ? 'rgba(196,99,58,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--terracotta)' : '3px solid transparent',
                transition:'var(--transition)',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--cream)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                    {other?.avatar ? <img src={other.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
                  </div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--charcoal)' }}>{other?.name || 'User'}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--slate)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.adoption?.animalName ? `re: ${r.adoption.animalName}` : ''}
                    </div>
                    {r.lastMessage && <div style={{ fontSize:'0.72rem', color:'#9e9e9e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1 }}>{r.lastMessage}</div>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Chat header */}
        <div style={{ padding:'12px 20px', background:'white', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', padding:4 }}>☰</button>
          )}
          <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, var(--terracotta), var(--ochre))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            {otherParty?.avatar ? <img src={otherParty.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
          </div>
          <div>
            <div style={{ fontWeight:700 }}>{otherParty?.name || 'Chat'}</div>
            <div style={{ fontSize:'0.775rem', color:'var(--slate)' }}>
              {room?.adoption ? (
                <Link to={`/adopt/${room.adoption._id}`} style={{ color:'var(--terracotta)' }}>
                  🐾 {room.adoption.animalName}
                </Link>
              ) : 'Adoption Discussion'}
            </div>
          </div>
          {room?.adoption && (
            <Link to={`/adopt/${room.adoption._id}`} style={{ marginLeft:'auto', background:'var(--cream)', border:'1px solid var(--border)', padding:'6px 14px', borderRadius:8, fontSize:'0.8rem', fontWeight:600, color:'var(--charcoal)', textDecoration:'none' }}>
              View Post →
            </Link>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 20px', display:'flex', flexDirection:'column', gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', margin:'auto', color:'var(--slate)', padding:40 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
              <p style={{ fontWeight:600 }}>Start the conversation!</p>
              <p style={{ fontSize:'0.875rem', marginTop:6 }}>
                Introduce yourself and ask about {room?.adoption?.animalName || 'the animal'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const mine = isMyMsg(msg);
            const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[i-1]?.createdAt).toDateString();
            return (
              <React.Fragment key={msg._id || i}>
                {showDate && (
                  <div style={{ textAlign:'center', margin:'8px 0' }}>
                    <span style={{ background:'rgba(0,0,0,0.06)', padding:'3px 12px', borderRadius:50, fontSize:'0.75rem', color:'var(--slate)' }}>
                      {format(new Date(msg.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start', animation:'slideInRight 0.2s ease' }}>
                  {!mine && (
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, marginRight:8, alignSelf:'flex-end' }}>
                      {msg.sender?.avatar ? <img src={msg.sender.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
                    </div>
                  )}
                  <div style={{ maxWidth:'70%' }}>
                    {!mine && (
                      <div style={{ fontSize:'0.72rem', color:'var(--slate)', marginBottom:3, paddingLeft:2 }}>{msg.sender?.name || msg.senderName}</div>
                    )}
                    <div style={{
                      padding:'10px 15px', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: mine ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))' : 'white',
                      color: mine ? 'white' : 'var(--charcoal)',
                      boxShadow: mine ? '0 2px 8px rgba(196,99,58,0.3)' : 'var(--shadow-sm)',
                      border: mine ? 'none' : '1px solid var(--border)',
                      fontSize:'0.9rem', lineHeight:1.5,
                      opacity: msg.isTemp ? 0.7 : 1,
                    }}>
                      {msg.message}
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--slate)', marginTop:3, textAlign: mine ? 'right' : 'left', paddingLeft: mine ? 0 : 2 }}>
                      {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'now'}
                      {msg.isTemp && ' · ⏳'}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {typingUser && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>👤</div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'18px 18px 18px 4px', padding:'10px 16px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--slate)', animation:`bounce 1.2s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize:'0.75rem', color:'var(--slate)' }}>{typingUser} is typing</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'12px 20px', background:'white', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              style={{
                flex:1, padding:'12px 16px', border:'2px solid var(--border)', borderRadius:16,
                outline:'none', fontSize:'0.9rem', fontFamily:'DM Sans, sans-serif', resize:'none',
                transition:'var(--transition)', lineHeight:1.5, maxHeight:120,
                background:'var(--cream)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending} style={{
              width:44, height:44, borderRadius:'50%',
              background: input.trim() ? 'var(--terracotta)' : 'var(--sand)',
              border:'none', cursor: input.trim() ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.1rem', transition:'var(--transition)', flexShrink:0,
              boxShadow: input.trim() ? '0 2px 8px rgba(196,99,58,0.35)' : 'none',
            }}>
              {sending ? '⏳' : '➤'}
            </button>
          </div>
          <p style={{ fontSize:'0.72rem', color:'var(--slate)', marginTop:6, textAlign:'center' }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
