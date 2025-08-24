import React, { useState, useEffect } from 'react';
import stickerGift from '../assets/gift.png';
import stickerCrown from '../assets/crown.png';
import stickerTg from '../assets/tg.png';

export type Friend = {
	id: string;
	name: string;
};

type FriendsProps = {
	friends?: Friend[];
};
type ChatMessage = { sender: string; text: string; timestamp: number };
type GuildMember = { id: string; name: string };
type Guild = { name: string; members: GuildMember[] };

const Friends: React.FC<FriendsProps> = ({ friends: initialFriends = [] }) => {
	const [friends, setFriends] = useState<Friend[]>(() => {
		try {
			return JSON.parse(localStorage.getItem('friends') || '[]');
		} catch {
			return initialFriends;
		}
	});
	const [addId, setAddId] = useState('');
	const [addName, setAddName] = useState('');
	const [addMsg, setAddMsg] = useState('');
	const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
	const [chatInput, setChatInput] = useState('');
	const [chatHistory, setChatHistory] = useState<{ [friendId: string]: ChatMessage[] }>(() => {
		try {
			return JSON.parse(localStorage.getItem('chatHistory') || '{}');
		} catch {
			return {};
		}
	});
	const [guild, setGuild] = useState<Guild | null>(() => {
		try {
			return JSON.parse(localStorage.getItem('guild') || 'null');
		} catch {
			return null;
		}
	});
	const [guildNameInput, setGuildNameInput] = useState('');

	useEffect(() => {
		localStorage.setItem('friends', JSON.stringify(friends));
	}, [friends]);

	useEffect(() => {
		if (guild) {
			localStorage.setItem('guild', JSON.stringify(guild));
		}
	}, [guild]);

	useEffect(() => {
		localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
	}, [chatHistory]);

	const handleAddFriend = () => {
		if (!addId || !addName) {
			setAddMsg('Enter both user ID and name.');
			return;
		}
		if (friends.some(f => f.id === addId)) {
			setAddMsg('Already added.');
			return;
		}
		setFriends(prev => [...prev, { id: addId, name: addName }]);
		setAddId('');
		setAddName('');
		setAddMsg('Friend added!');
		setTimeout(() => setAddMsg(''), 1200);
	};

	const handleSelectFriend = (friend: Friend) => {
		setSelectedFriend(friend);
	};

	const handleSendMessage = () => {
		if (!selectedFriend || !chatInput.trim()) return;
		const userId = localStorage.getItem('userId') || 'You';
		const msg: ChatMessage = {
			sender: userId,
			text: chatInput,
			timestamp: Date.now(),
		};
		setChatHistory(prev => ({
			...prev,
			[selectedFriend.id]: [...(prev[selectedFriend.id] || []), msg],
		}));
		setChatInput('');
	};

	const handleCreateGuild = () => {
		if (!guildNameInput.trim()) return;
		const userId = localStorage.getItem('userId') || 'You';
		const userName = localStorage.getItem('userName') || 'You';
		setGuild({ name: guildNameInput.trim(), members: [{ id: userId, name: userName }] });
		setGuildNameInput('');
	};

	const handleJoinGuild = () => {
		if (!guildNameInput.trim()) return;
		const userId = localStorage.getItem('userId') || 'You';
		const userName = localStorage.getItem('userName') || 'You';
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
		} else {
			setGuild({ name: guildNameInput.trim(), members: [{ id: userId, name: userName }] });
		}
		setGuildNameInput('');
	};

	return (
		<div style={{ maxWidth: 340, margin: '20px auto', padding: 12, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', borderRadius: 12, boxShadow: '0 2px 12px #24308a11' }}>
			{/* Guild/Team Section */}
			<div style={{ margin: '18px 0', padding: 10, background: '#f0f7ff', borderRadius: 8, boxShadow: '0 1px 4px #24308a10' }}>
				<div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Guild / Team</div>
				{guild ? (
					<div>
						<div style={{ fontSize: 11, marginBottom: 4 }}><b>Guild:</b> {guild.name}</div>
						<div style={{ fontSize: 10, marginBottom: 4 }}><b>Members:</b></div>
						<ul style={{ fontSize: 10, margin: 0, padding: 0, listStyle: 'none' }}>
							{guild.members.map((m, i) => (
								<li key={m.id + i} style={{ marginBottom: 2 }}>{m.name} <span style={{ color: '#888', fontSize: 9 }}>({m.id})</span></li>
							))}
						</ul>
					</div>
				) : (
					<div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
						<input
							value={guildNameInput}
							onChange={e => setGuildNameInput(e.target.value)}
							placeholder="Guild name"
							style={{ fontSize: 10, borderRadius: 4, padding: 2, width: 90 }}
						/>
						<button onClick={handleCreateGuild} style={{ fontSize: 10, borderRadius: 4, padding: '2px 8px', background: '#ffe259', fontWeight: 700 }}>Create</button>
						<button onClick={handleJoinGuild} style={{ fontSize: 10, borderRadius: 4, padding: '2px 8px', background: '#b8e259', fontWeight: 700 }}>Join</button>
					</div>
				)}
			</div>
			<div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Your Friends</div>
			<div style={{ marginBottom: 10 }}>
				<input
					value={addId}
					onChange={e => setAddId(e.target.value)}
					placeholder="User ID"
					style={{ fontSize: 10, borderRadius: 4, padding: 2, marginRight: 4, width: 70 }}
				/>
				<input
					value={addName}
					onChange={e => setAddName(e.target.value)}
					placeholder="Name"
					style={{ fontSize: 10, borderRadius: 4, padding: 2, marginRight: 4, width: 70 }}
				/>
				<button onClick={handleAddFriend} style={{ fontSize: 10, borderRadius: 4, padding: '2px 8px', background: '#ffe259', fontWeight: 700 }}>Add Friend</button>
				{addMsg && <span style={{ fontSize: 10, color: '#1bbf4c', marginLeft: 8 }}>{addMsg}</span>}
			</div>
			<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
				{friends.length === 0 && <li style={{ fontSize: 10, color: '#888' }}>No friends yet. Invite some!</li>}
				{friends.map((friend) => (
					<li key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, background: selectedFriend?.id === friend.id ? '#e6f7ff' : '#fff', borderRadius: 6, padding: '4px 8px', boxShadow: '0 1px 2px #24308a08', fontSize: 10, cursor: 'pointer' }}>
						<span style={{ flex: 1 }} onClick={() => handleSelectFriend(friend)}>
							{friend.name} <span style={{ color: '#888', fontSize: 9 }}>({friend.id})</span>
						</span>
					</li>
				))}
			</ul>
			{/* Chat UI */}
			{selectedFriend && (
				<div style={{ marginTop: 16, background: '#f7faff', borderRadius: 8, padding: 10, boxShadow: '0 1px 4px #24308a10' }}>
					<div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
						Chat with {selectedFriend.name}
						<button style={{ float: 'right', fontSize: 10, border: 'none', background: 'none', color: '#888', cursor: 'pointer' }} onClick={() => setSelectedFriend(null)}>×</button>
					</div>
					<div style={{ maxHeight: 120, overflowY: 'auto', background: '#fff', borderRadius: 6, padding: 6, marginBottom: 8, fontSize: 10 }}>
						{(chatHistory[selectedFriend.id] || []).length === 0 && <div style={{ color: '#aaa' }}>No messages yet.</div>}
						{(chatHistory[selectedFriend.id] || []).map((msg, idx) => (
							<div key={idx} style={{ marginBottom: 4, textAlign: msg.sender === (localStorage.getItem('userId') || 'You') ? 'right' : 'left' }}>
								<span style={{ background: msg.sender === (localStorage.getItem('userId') || 'You') ? '#e6f7ff' : '#ffe259', borderRadius: 4, padding: '2px 6px', display: 'inline-block' }}>
									<b>{msg.sender === (localStorage.getItem('userId') || 'You') ? 'You' : selectedFriend.name}:</b> {msg.text.startsWith(':sticker:') ? (
										<img src={msg.text.replace(':sticker:', '')} alt="sticker" style={{ height: 24, verticalAlign: 'middle' }} />
									) : msg.text}
								</span>
								<span style={{ color: '#bbb', fontSize: 8, marginLeft: 4 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
							</div>
						))}
					</div>
					{/* Emoji and Sticker Picker */}
					<div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
						{/* Emoji Picker */}
						<div style={{ display: 'flex', gap: 2 }}>
							{["😀","😂","😍","😎","🥳","😇","😜","🤩","😭","🔥","💎","🎉"].map(emoji => (
								<button key={emoji} style={{ fontSize: 14, border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setChatInput(chatInput + emoji)}>{emoji}</button>
							))}
						</div>
						{/* Sticker Picker */}
						<div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
							<button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setChatInput(':sticker:' + stickerGift)}><img src={stickerGift} alt="gift" style={{ height: 22 }} /></button>
							<button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setChatInput(':sticker:' + stickerCrown)}><img src={stickerCrown} alt="crown" style={{ height: 22 }} /></button>
							<button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setChatInput(':sticker:' + stickerTg)}><img src={stickerTg} alt="tg" style={{ height: 22 }} /></button>
						</div>
					</div>
					<div style={{ display: 'flex', gap: 4 }}>
						<input
							value={chatInput}
							onChange={e => setChatInput(e.target.value)}
							onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
							placeholder="Type a message..."
							style={{ flex: 1, fontSize: 10, borderRadius: 4, padding: 4 }}
						/>
						<button onClick={handleSendMessage} style={{ fontSize: 10, borderRadius: 4, padding: '2px 10px', background: '#ffe259', fontWeight: 700 }}>Send</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Friends;
