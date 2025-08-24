import pacmanIcon from '../assets/pacman.png';
import asteroidsIcon from '../assets/rocket.png';
import tetrisIcon from '../assets/shape.png';
import plinkoIcon from '../assets/play.png';
import slotIcon from '../assets/vecteezy_crown-slot-machine_58273750.png';

import React, { useState } from 'react';
import MemoryMatch from '../ArcadeGames/MemoryMatch';


import ArcadePacman from './ArcadePacman';
import ArcadeAsteroids from './ArcadeAsteroids';
import ArcadeTetris from './ArcadeTetris';
import ArcadePlinko from './ArcadePlinko';
import ArcadeSlotMachine from './ArcadeSlotMachine';


const Arcade: React.FC<{ coinBalance?: number; onDeposit?: (amount: number) => void; onWithdraw?: (amount: number) => void; onScore?: (score: number) => void; }> = (props) => {
	const [playerName, setPlayerName] = useState('Player' + Math.floor(Math.random() * 1000));
	const [selectedGame, setSelectedGame] = useState<null | 'Pacman' | 'Asteroids' | 'Tetris' | 'Plinko' | 'SlotMachine' | 'MemoryMatch'>(null);

		if (selectedGame === 'Pacman')
			return <ArcadePacman onBack={() => setSelectedGame(null)} playerName={playerName} />;
		if (selectedGame === 'Asteroids')
			return <ArcadeAsteroids onBack={() => setSelectedGame(null)} playerName={playerName} />;
		if (selectedGame === 'Tetris')
			return <ArcadeTetris onBack={() => setSelectedGame(null)} playerName={playerName} />;
		if (selectedGame === 'Plinko')
			return <ArcadePlinko onBack={() => setSelectedGame(null)} playerName={playerName} />;
		if (selectedGame === 'SlotMachine')
			return <ArcadeSlotMachine
				playerName={playerName}
				coinBalance={props.coinBalance || 0}
				onDeposit={props.onDeposit || (() => {})}
				onWithdraw={props.onWithdraw || (() => {})}
				onScore={props.onScore || (() => {})}
				onBack={() => setSelectedGame(null)}
			/>;
		if (selectedGame === 'MemoryMatch')
			return <MemoryMatch onScore={props.onScore || (() => {})} />;

		// Example seasonal event (can be made dynamic)
		const isEventActive = true;
		const eventName = 'Summer Memory Match!';
		const eventDesc = 'Play Memory Match for bonus rewards this week!';

		return (
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
				<h2>Arcade Mini-Games</h2>
				{isEventActive && (
					<div style={{ background: '#ffe259', color: '#24308a', borderRadius: 10, padding: '10px 18px', fontWeight: 700, marginBottom: 8, boxShadow: '0 2px 8px #24308a22' }}>
						<span style={{ fontSize: 16 }}>🌞 {eventName}</span>
						<div style={{ fontSize: 13, fontWeight: 400 }}>{eventDesc}</div>
					</div>
				)}
				<div style={{ marginBottom: 12 }}>
					<label style={{ color: '#fff' }}>
						Your Name: <input value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ borderRadius: 4, padding: 2 }} />
					</label>
				</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
				<button
					className="arcade-game"
					style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
					onClick={() => setSelectedGame('MemoryMatch')}
					aria-label="Play Memory Match"
					tabIndex={0}
					onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('MemoryMatch'); }}
					onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
					onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
				>
					<span style={{ fontSize: 32, marginBottom: 4 }}>🧠</span>
					Memory Match
				</button>
							<button
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
								onClick={() => setSelectedGame('Pacman')}
								aria-label="Play Pacman"
								tabIndex={0}
								onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('Pacman'); }}
								onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
								onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
							>
								<img src={pacmanIcon} alt="Pacman" style={{ width: 38, marginBottom: 4 }} />
								Pacman
							</button>
							<button
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
								onClick={() => setSelectedGame('Asteroids')}
								aria-label="Play Asteroids"
								tabIndex={0}
								onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('Asteroids'); }}
								onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
								onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
							>
								<img src={asteroidsIcon} alt="Asteroids" style={{ width: 38, marginBottom: 4 }} />
								Asteroids
							</button>
							<button
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
								onClick={() => setSelectedGame('Tetris')}
								aria-label="Play Tetris"
								tabIndex={0}
								onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('Tetris'); }}
								onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
								onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
							>
								<img src={tetrisIcon} alt="Tetris" style={{ width: 38, marginBottom: 4 }} />
								Tetris
							</button>
							<button
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
								onClick={() => setSelectedGame('Plinko')}
								aria-label="Play Plinko"
								tabIndex={0}
								onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('Plinko'); }}
								onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
								onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
							>
								<img src={plinkoIcon} alt="Plinko" style={{ width: 38, marginBottom: 4 }} />
								Plinko
							</button>
							<button
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, background: 'linear-gradient(135deg,#f39c12,#e74c3c,#00bfff,#f9e79f)', color: '#fff', fontWeight: 700, boxShadow: '0 0 16px #f39c12', outline: 'none', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
								onClick={() => setSelectedGame('SlotMachine')}
								aria-label="Play Slot Machine"
								tabIndex={0}
								onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGame('SlotMachine'); }}
								onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
								onBlur={e => e.currentTarget.style.boxShadow = '0 0 16px #f39c12'}
							>
								<img src={slotIcon} alt="Slot Machine" style={{ width: 38, marginBottom: 4 }} />
								Slot Machine 🎰
							</button>
						</div>
		</div>
	);
};

export default Arcade;
