import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './Friends.module.scss';
import stickerGift from '../assets/gift.png';
import stickerCrown from '../assets/crown.png';
import stickerTg from '../assets/tg.png';
import { supabase } from '../supabaseClient';

type Friend = { id: string; name: string };
type GuildMember = { id: string; name: string };
type Guild = { name: string; members: GuildMember[] };
type ChatMessage = { sender: string; text: string; timestamp: number };
type ChatMode = 'private' | 'guild' | 'group';


interface FriendsProps {
  setCurrentView?: (view: string) => void;
}

const Friends: React.FC<FriendsProps> = ({ setCurrentView }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    const stored = localStorage.getItem('friends');
    return stored ? JSON.parse(stored) : [];
  });
  const [addId, setAddId] = useState('');
  const [addName, setAddName] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(() => {
    const stored = localStorage.getItem('selectedFriend');
    return stored ? JSON.parse(stored) : null;
  });
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guild, setGuild] = useState<Guild | null>(() => {
    const storedGuild = localStorage.getItem('guild');
    return storedGuild ? JSON.parse(storedGuild) : null;
  });
  const [guildNameInput, setGuildNameInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('private');
  const [groupId, setGroupId] = useState('');
  const userId = localStorage.getItem('userId') || 'me';
  const userName = localStorage.getItem('userName') || 'Me';

  useEffect(() => {
    // Load friends from localStorage
    const stored = localStorage.getItem('friends');
    if (stored) setFriends(JSON.parse(stored));
    // Load guild from localStorage
    const storedGuild = localStorage.getItem('guild');
    if (storedGuild) setGuild(JSON.parse(storedGuild));
  }, []);

  // Fetch chat messages from Supabase for selected friend (private chat only for now)
  useEffect(() => {
    if (chatMode !== 'private' || !selectedFriend) {
      setMessages([]);
      return;
    }
    let isMounted = true;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},recipient_id.eq.${userId})`)
        .order('timestamp', { ascending: true });
      if (!error && isMounted) {
        setMessages(
          (data || []).map((msg: any) => ({
            sender: String(msg.sender_id),
            text: msg.text,
            timestamp: new Date(msg.timestamp).getTime(),
          }))
        );
      }
    };
    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [chatMode, selectedFriend, userId]);

  const handleAddFriend = () => {
    if (!addId.trim() || !addName.trim()) {
      setAddMsg('Enter both ID and Name');
      return;
    }
    if (friends.some(f => f.id === addId)) {
      setAddMsg('Already friends');
      return;
    }
    const newFriend = { id: addId, name: addName };
    const updated = [...friends, newFriend];
    setFriends(updated);
    localStorage.setItem('friends', JSON.stringify(updated));
    setAddId('');
    setAddName('');
    setAddMsg('Friend added!');
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setChatMode('private');
  };

  const handleSendMessage = async () => {
    if (chatMode !== 'private' || !selectedFriend || !chatInput.trim()) return;
    const { error } = await supabase.from('messages').insert([
      {
        sender_id: userId,
        recipient_id: selectedFriend.id,
        text: chatInput,
      },
    ]);
    if (!error) setChatInput('');
  };

  const handleCreateGuild = () => {
    if (!guildNameInput.trim()) return;
    const newGuild: Guild = {
      name: guildNameInput.trim(),
      members: [{ id: userId, name: userName }],
    };
    setGuild(newGuild);
    localStorage.setItem('guild', JSON.stringify(newGuild));
    setGuildNameInput('');
  };

  const handleJoinGuild = () => {
    let storedGuild: Guild | null = null;
    try {
      storedGuild = JSON.parse(localStorage.getItem('guild') || 'null');
    } catch {
      storedGuild = null;
    }
    if (storedGuild && storedGuild.name === guildNameInput.trim()) {
      if (!storedGuild.members.some((m: GuildMember) => m.id === userId)) {
        storedGuild.members.push({ id: userId, name: userName });
      }
      setGuild({ ...storedGuild });
      localStorage.setItem('guild', JSON.stringify(storedGuild));
    } else {
      setGuild({ name: guildNameInput.trim(), members: [{ id: userId, name: userName }] });
      localStorage.setItem('guild', JSON.stringify({ name: guildNameInput.trim(), members: [{ id: userId, name: userName }] }));
    }
    setGuildNameInput('');
  };

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    if (guild) {
      localStorage.setItem('guild', JSON.stringify(guild));
    }
  }, [guild]);

  useEffect(() => {
    if (selectedFriend) {
      localStorage.setItem('selectedFriend', JSON.stringify(selectedFriend));
    } else {
      localStorage.removeItem('selectedFriend');
    }
  }, [selectedFriend]);

  return (
    <>
      <div className={styles.friendsContainer}>
        {/* Guild/Team Section */}
        <div className={styles.guildSection}>
          <div className={styles.guildTitle}>Guild / Team</div>
          {guild ? (
            <div>
              <div className={styles.guildName}><b>Guild:</b> {guild.name}</div>
              <div className={styles.guildMembersTitle}><b>Members:</b></div>
              <ul className={styles.guildMembersList}>
                {guild.members.map((m, i) => (
                  <li key={m.id + i} className={styles.guildMemberItem}>{m.name} <span className={styles.guildMemberId}>({m.id})</span></li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={styles.guildInputRow}>
              <input
                value={guildNameInput}
                onChange={e => setGuildNameInput(e.target.value)}
                placeholder="Guild name"
                className={styles.guildInput}
              />
              <button onClick={handleCreateGuild} className={styles.guildCreateBtn}>Create</button>
              <button onClick={handleJoinGuild} className={styles.guildJoinBtn}>Join</button>
            </div>
          )}
        </div>
        <div className={styles.friendsTitle}>Your Friends</div>
        <div className={styles.addFriendRow}>
          <input
            value={addId}
            onChange={e => setAddId(e.target.value)}
            placeholder="User ID"
            className={styles.addFriendInput}
          />
          <input
            value={addName}
            onChange={e => setAddName(e.target.value)}
            placeholder="Name"
            className={styles.addFriendInput}
          />
          <button onClick={handleAddFriend} className={styles.addFriendBtn}>Add Friend</button>
          {addMsg && <span className={styles.addFriendMsg}>{addMsg}</span>}
        </div>
        <ul className={styles.friendsList}>
          {friends.length === 0 && <li className={styles.noFriends}>No friends yet. Invite some!</li>}
          {friends.map((friend) => (
            <li key={friend.id} className={selectedFriend?.id === friend.id ? styles.friendItemSelected : styles.friendItem}>
              <span className={styles.friendName} onClick={() => handleSelectFriend(friend)}>
                {friend.name} <span className={styles.friendId}>({friend.id})</span>
              </span>
            </li>
          ))}
        </ul>
        {/* Chat Mode Selector */}
        <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          <button className={styles.toggleBtn} onClick={() => { setChatMode('private'); setSelectedFriend(null); }}>Private</button>
          <button className={styles.toggleBtn} onClick={() => setChatMode('guild')}>Guild</button>
          <button className={styles.toggleBtn} onClick={() => setChatMode('group')}>Group</button>
          {chatMode === 'group' && (
            <input
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              placeholder="Group ID"
              style={{ fontSize: 10, borderRadius: 4, padding: 2, width: 80 }}
            />
          )}
        </div>
        {/* Chat UI (private chat only for now) */}
        {selectedFriend && chatMode === 'private' && (
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              Chat with {selectedFriend.name}
              <button className={styles.chatCloseBtn} onClick={() => setSelectedFriend(null)}>×</button>
            </div>
            <div className={styles.chatHistory}>
              {messages.length === 0 && <div className={styles.noMessages}>No messages yet.</div>}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.sender === userId
                      ? `${styles.chatMessage} ${styles.alignRight}`
                      : `${styles.chatMessage} ${styles.alignLeft}`
                  }
                >
                  <span className={msg.sender === userId ? styles.chatBubbleMe : styles.chatBubbleOther}>
                    <b>{msg.sender === userId ? 'You' : selectedFriend.name}:</b>{' '}
                    {msg.text.startsWith(':sticker:') ? (
                      <img src={msg.text.replace(':sticker:', '')} alt="sticker" className={styles.stickerImg} />
                    ) : (
                      msg.text
                    )}
                  </span>
                  <span className={styles.chatTimestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            {/* Emoji and Sticker Picker */}
            <div className={styles.emojiRow}>
              {/* Emoji Picker */}
              <div className={styles.emojiPicker}>
                {[
                  "😀","😂","😍","😎","🥳","😇","😜","🤩","😭","🔥","💎","🎉"
                ].map(emoji => (
                  <button key={emoji} className={styles.emojiBtn} onClick={() => setChatInput(chatInput + emoji)}>{emoji}</button>
                ))}
              </div>
              {/* Sticker Picker */}
              <div className={styles.stickerPicker}>
                <button className={styles.stickerBtn} onClick={() => setChatInput(':sticker:' + stickerGift)}><img src={stickerGift} alt="gift" className={styles.stickerIcon} /></button>
                <button className={styles.stickerBtn} onClick={() => setChatInput(':sticker:' + stickerCrown)}><img src={stickerCrown} alt="crown" className={styles.stickerIcon} /></button>
                <button className={styles.stickerBtn} onClick={() => setChatInput(':sticker:' + stickerTg)}><img src={stickerTg} alt="tg" className={styles.stickerIcon} /></button>
              </div>
            </div>
            <div className={styles.chatInputRow}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Type a message..."
                className={styles.chatInput}
              />
              <button onClick={handleSendMessage} className={styles.sendBtn}>Send</button>
            </div>
          </div>
        )}
      </div>
      {/* Fixed Toggle Buttons for Chat and Events at bottom of screen */}
      <div className={styles.toggleRowFixed}>
        <button className={styles.toggleBtn} onClick={() => setCurrentView && setCurrentView('events')}>
          Events
        </button>
        <button className={styles.toggleBtn} onClick={() => setCurrentView && setCurrentView('chat')}>
          Chat
        </button>
      </div>
    </>
  );
};

export default Friends;