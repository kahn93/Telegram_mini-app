import ArcadeDangerousBeautySlot from './ArcadeDangerousBeautySlot';
import ArcadeMoonMaidenSlot from './ArcadeMoonMaidenSlot';
import ArcadeRType from './ArcadeRType';
import ArcadePunchOut from './ArcadePunchOut';
import ArcadeQbert from './ArcadeQbert';
import ArcadeRampage from './ArcadeRampage';
import ArcadeStreetFighter from './ArcadeStreetFighter';


import * as React from 'react';
import { useState, useEffect } from 'react';
import MemoryMatch from '../ArcadeGames/MemoryMatch';
import ArcadeDonkeyKong from './ArcadeDonkeyKong';
import ArcadeSpaceInvaders from './ArcadeSpaceInvaders';
import ArcadeSinistar from './ArcadeSinistar';
import ArcadeCommando from './ArcadeCommando';

import ArcadeCentipede from './ArcadeCentipede';
import ArcadeJoust from './ArcadeJoust';
import ArcadeSnake from './ArcadeSnake';
import ArcadeDigDug from './ArcadeDigDug';
import ArcadePaperBoy from './ArcadePaperBoy';


import ArcadePacman from './ArcadePacman';
import ArcadeAsteroids from './ArcadeAsteroids';
import ArcadeTetris from './ArcadeTetris';
import ArcadePlinko from './ArcadePlinko';

import ArcadeSlotMachine from './ArcadeSlotMachine';
import ArcadeSlotMachine2 from './ArcadeSlotMachine2';
import ArcadeSlotMachine3 from './ArcadeSlotMachine3';


interface ArcadeProps {
	userId: string;
	coinBalance?: number;
	onDeposit?: (amount: number) => void;
	onWithdraw?: (amount: number) => void;
	onScore?: (score: number) => void;
}


type GameName = 'Pacman' | 'Asteroids' | 'Tetris' | 'Plinko' | 'SlotMachine' | 'SlotMachine2' | 'SlotMachine3' | 'DangerousBeautySlot' | 'MoonMaidenSlot' | 'MemoryMatch' | 'DonkeyKong' | 'SpaceInvaders' | 'Joust' | 'Sinistar' | 'Commando' | 'Centipede' | 'Snake' | 'DigDug' | 'PaperBoy' | 'PunchOut' | 'Qbert' | 'Rampage' | 'StreetFighter' | 'RType';
// All game selection logic and buttons are now handled inside the Arcade component below.
const Arcade: React.FC<ArcadeProps> = (props) => {
	const userId = props.userId;
	const [selectedGame, setSelectedGame] = useState<null | GameName>(() => {
		const saved = localStorage.getItem('selectedGame');
		return saved ? (saved as GameName) : null;
	});
	const [lastGameScore, setLastGameScore] = useState<number>(() => {
		const stored = localStorage.getItem('lastGameScore');
		return stored ? parseInt(stored, 10) : 0;
	});
	useEffect(() => {
		if (selectedGame) {
			localStorage.setItem('selectedGame', selectedGame);
		} else {
			localStorage.removeItem('selectedGame');
		}
	}, [selectedGame]);
	useEffect(() => {
		localStorage.setItem('lastGameScore', lastGameScore.toString());
	}, [lastGameScore]);

	let gameComponent: React.ReactNode = null;
	if (selectedGame === 'PunchOut')
		gameComponent = <ArcadePunchOut />;
	else if (selectedGame === 'DonkeyKong')
		gameComponent = <ArcadeDonkeyKong onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'Pacman')
		gameComponent = <ArcadePacman onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'Asteroids')
		gameComponent = <ArcadeAsteroids onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'Tetris')
		gameComponent = <ArcadeTetris onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'Plinko')
		gameComponent = <ArcadePlinko onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'SlotMachine')
		gameComponent = <ArcadeSlotMachine
			userId={userId}
			coinBalance={props.coinBalance || 0}
			onDeposit={props.onDeposit || (() => {})}
			onWithdraw={props.onWithdraw || (() => {})}
			onScore={props.onScore || (() => {})}
			onBack={() => setSelectedGame(null)}
		/>;
	else if (selectedGame === 'SlotMachine2')
		gameComponent = <ArcadeSlotMachine2 userId={userId} onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'SlotMachine3')
		gameComponent = <ArcadeSlotMachine3 userId={userId} onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'MemoryMatch')
		gameComponent = <MemoryMatch onScore={props.onScore || (() => {})} />;
	else if (selectedGame === 'Sinistar')
		gameComponent = <ArcadeSinistar onBack={() => setSelectedGame(null)} userId={userId} />;
	else if (selectedGame === 'Commando')
		gameComponent = <ArcadeCommando />;
	else if (selectedGame === 'Centipede')
		gameComponent = <ArcadeCentipede />;
	else if (selectedGame === 'Snake')
		gameComponent = <ArcadeSnake />;
	else if (selectedGame === 'DigDug')
		gameComponent = <ArcadeDigDug />;
	else if (selectedGame === 'Joust')
		gameComponent = <ArcadeJoust onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'SpaceInvaders')
		gameComponent = <ArcadeSpaceInvaders onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'PaperBoy')
		gameComponent = <ArcadePaperBoy />;
	else if (selectedGame === 'Qbert')
		gameComponent = <ArcadeQbert userId={userId} />;
	else if (selectedGame === 'Rampage')
		gameComponent = <ArcadeRampage userId={userId} />;
	else if (selectedGame === 'StreetFighter')
		gameComponent = <ArcadeStreetFighter userId={userId} />;

	else if (selectedGame === 'RType')
		gameComponent = <ArcadeRType userId={''} />;
	else if (selectedGame === 'DangerousBeautySlot')
		gameComponent = <ArcadeDangerousBeautySlot userId={userId} onBack={() => setSelectedGame(null)} />;
	else if (selectedGame === 'MoonMaidenSlot')
		gameComponent = <ArcadeMoonMaidenSlot userId={userId} onBack={() => setSelectedGame(null)} />;

	const gameButtons = [
		{ key: 'DangerousBeautySlot', label: 'Dangerous Beauty', onClick: () => setSelectedGame('DangerousBeautySlot') },
		{ key: 'MoonMaidenSlot', label: 'Moon Maiden', onClick: () => setSelectedGame('MoonMaidenSlot') },
		{ key: 'PunchOut', label: 'Punch Out', onClick: () => setSelectedGame('PunchOut') },
		{ key: 'MemoryMatch', label: 'Memory Match', onClick: () => setSelectedGame('MemoryMatch') },
		{ key: 'DonkeyKong', label: 'Donkey Kong', onClick: () => setSelectedGame('DonkeyKong') },
		{ key: 'Pacman', label: 'Pacman', onClick: () => setSelectedGame('Pacman') },
		{ key: 'Asteroids', label: 'Asteroids', onClick: () => setSelectedGame('Asteroids') },
		{ key: 'Tetris', label: 'Tetris', onClick: () => setSelectedGame('Tetris') },
		{ key: 'Plinko', label: 'Plinko', onClick: () => setSelectedGame('Plinko') },
		{ key: 'SlotMachine', label: 'Slot Machine', onClick: () => setSelectedGame('SlotMachine') },
		{ key: 'SlotMachine2', label: 'Cyberpunk Slot', onClick: () => setSelectedGame('SlotMachine2') },
		{ key: 'SlotMachine3', label: 'Egypt Slot', onClick: () => setSelectedGame('SlotMachine3') },
		{ key: 'Sinistar', label: 'Sinistar', onClick: () => setSelectedGame('Sinistar') },
		{ key: 'Commando', label: 'Commando', onClick: () => setSelectedGame('Commando') },
		{ key: 'Centipede', label: 'Centipede', onClick: () => setSelectedGame('Centipede') },
		{ key: 'Snake', label: 'Snake', onClick: () => setSelectedGame('Snake') },
		{ key: 'DigDug', label: 'Dig Dug', onClick: () => setSelectedGame('DigDug') },
		{ key: 'Joust', label: 'Joust', onClick: () => setSelectedGame('Joust') },
		{ key: 'SpaceInvaders', label: 'Space Invaders', onClick: () => setSelectedGame('SpaceInvaders') },
		{ key: 'PaperBoy', label: 'Paper Boy', onClick: () => setSelectedGame('PaperBoy') },
		{ key: 'Qbert', label: 'Q*bert', onClick: () => setSelectedGame('Qbert') },
		{ key: 'Rampage', label: 'Rampage', onClick: () => setSelectedGame('Rampage') },
		{ key: 'StreetFighter', label: 'Street Fighter', onClick: () => setSelectedGame('StreetFighter') },
		{ key: 'RType', label: 'R-Type', onClick: () => setSelectedGame('RType') },
	];

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
			{gameComponent ? (
				gameComponent
			) : (
				<>
					<h2>Arcade Mini-Games</h2>
					{/* Event banner moved to Events page */}
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
						{gameButtons.map(btn => (
												<button
													key={btn.key}
													className="arcade-game"
													style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
													onClick={btn.onClick}
													aria-label={`Play ${btn.key}`}
													tabIndex={0}
													onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') btn.onClick(); }}
													onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
													onBlur={e => e.currentTarget.style.boxShadow = '0 0 0 2px #24308a33'}
												>
													{btn.label}
												</button>
						))}
					</div>
				</>
			)}
		</div>
	);
// Removed stray/duplicate button blocks after the main Arcade component's return.
};

export default Arcade;
