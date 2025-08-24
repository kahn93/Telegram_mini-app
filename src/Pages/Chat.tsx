import React, { useEffect, useState, useRef } from 'react';
import { getMessages, sendMessage, Message } from '../Database/messagesSupabase';
import { getUserSupabase } from '../Database/dbSupabase';
import listIcon from '../assets/list.png';

const Chat: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, { nickname?: string; avatar_url?: string }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const msgs = await getMessages(50, 'chat');
      setMessages(msgs.reverse());
      setLoading(false);
      // Fetch user info for avatars/nicknames
      const ids = Array.from(new Set(msgs.map(m => m.userid)));
      const userInfos: Record<string, { nickname?: string; avatar_url?: string }> = {};
      await Promise.all(ids.map(async id => {
        const user = await getUserSupabase(id);
        if (user) userInfos[id] = { nickname: user.nickname, avatar_url: user.avatar_url };
      }));
      setUserMap(userInfos);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await sendMessage(userId, input.trim());
    setInput('');
    setSending(false);
    // Refresh messages
    const msgs = await getMessages(50, 'chat');
    setMessages(msgs.reverse());
  };

  return (
    <div style={{ maxWidth: 400, margin: '24px auto', background: '#f8fafc', borderRadius: 12, padding: 12, boxShadow: '0 2px 8px #24308a11', display: 'flex', flexDirection: 'column', height: 420 }}>
      <h3 style={{ color: '#24308a', fontWeight: 800, fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={listIcon} alt="Chat" style={{ width: 22, verticalAlign: 'middle' }} />
        Community Chat
      </h3>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #eee' }}>
        {loading ? <div>Loading...</div> : messages.length === 0 ? <div style={{ color: '#888' }}>No messages yet.</div> : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <img src={userMap[msg.userid]?.avatar_url || '/vite.svg'} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 8, border: '1px solid #ffe259' }} />
              <div>
                <span style={{ fontWeight: 700, color: '#24308a', fontSize: 12 }}>{userMap[msg.userid]?.nickname || msg.userid}</span>
                <span style={{ color: '#888', fontSize: 10, marginLeft: 8 }}>{msg.created_at?.slice(11, 16)}</span>
                <div style={{ fontSize: 13 }}>{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          style={{ flex: 1, borderRadius: 6, padding: 6, border: '1px solid #ffe259' }}
          disabled={sending}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()} style={{ background: '#ffe259', borderRadius: 6, padding: '4px 16px', fontWeight: 700 }}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
