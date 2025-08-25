import ArcadeRType from './ArcadeRType';
import ArcadePunchOut from './ArcadePunchOut';
import ArcadeQbert from './ArcadeQbert';
import ArcadeRampage from './ArcadeRampage';
import ArcadeStreetFighter from './ArcadeStreetFighter';
import pacmanIcon from '../assets/pacman.png';
import asteroidsIcon from '../assets/rocket.png';
import tetrisIcon from '../assets/shape.png';
import plinkoIcon from '../assets/play.png';
import slotIcon from '../assets/vecteezy_crown-slot-machine_58273750.png';

import * as React from 'react';
import { useState } from 'react';
import MemoryMatch from '../ArcadeGames/MemoryMatch';
import ArcadeDonkeyKong from './ArcadeDonkeyKong';
import ArcadeSpaceInvaders from './ArcadeSpaceInvaders';
import ArcadeSinistar from './ArcadeSinistar';
import ArcadeCommando from './ArcadeCommando';

import ArcadeCentipede from './ArcadeCentipede';
import ArcadeJoust from './ArcadeJoust';
import ArcadeSnake from './ArcadeSnake';
import ArcadeDigDug from './ArcadeDigDug';
import ArcadeGalaga from './ArcadeGalaga';
import ArcadePaperBoy from './ArcadePaperBoy';


import ArcadePacman from './ArcadePacman';
import ArcadeAsteroids from './ArcadeAsteroids';
import ArcadeTetris from './ArcadeTetris';
import ArcadePlinko from './ArcadePlinko';
import ArcadeSlotMachine from './ArcadeSlotMachine';


interface ArcadeProps {
	userId: string;
	coinBalance?: number;
	onDeposit?: (amount: number) => void;
	onWithdraw?: (amount: number) => void;
	onScore?: (score: number) => void;
}


type GameName = 'Pacman' | 'Asteroids' | 'Tetris' | 'Plinko' | 'SlotMachine' | 'MemoryMatch' | 'DonkeyKong' | 'SpaceInvaders' | 'Joust' | 'Sinistar' | 'Commando' | 'Centipede' | 'Snake' | 'DigDug' | 'Galaga' | 'PaperBoy' | 'PunchOut' | 'Qbert' | 'Rampage' | 'StreetFighter' | 'RType';
// All game selection logic and buttons are now handled inside the Arcade component below.
const Arcade: React.FC<ArcadeProps> = (props) => {
	const userId = props.userId;
	const [selectedGame, setSelectedGame] = useState<null | GameName>(null);
	// Example seasonal event (can be made dynamic)
	const isEventActive = true;
	const eventName = 'Summer Memory Match!';
	const eventDesc = 'Play Memory Match for bonus rewards this week!';

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
	else if (selectedGame === 'Galaga')
		gameComponent = <ArcadeGalaga />;
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

	const gameButtons = [
		{ key: 'PunchOut', label: '🥊 Punch Out', onClick: () => setSelectedGame('PunchOut') },
		{ key: 'MemoryMatch', label: '🧠 Memory Match', onClick: () => setSelectedGame('MemoryMatch') },
		{ key: 'DonkeyKong', label: '� Donkey Kong', onClick: () => setSelectedGame('DonkeyKong') },
		{ key: 'Pacman', label: <><img src={pacmanIcon} alt="Pacman" style={{ width: 38, marginBottom: 4 }} />Pacman</>, onClick: () => setSelectedGame('Pacman') },
		{ key: 'Asteroids', label: <><img src={asteroidsIcon} alt="Asteroids" style={{ width: 38, marginBottom: 4 }} />Asteroids</>, onClick: () => setSelectedGame('Asteroids') },
		{ key: 'Tetris', label: <><img src={tetrisIcon} alt="Tetris" style={{ width: 38, marginBottom: 4 }} />Tetris</>, onClick: () => setSelectedGame('Tetris') },
		{ key: 'Plinko', label: <><img src={plinkoIcon} alt="Plinko" style={{ width: 38, marginBottom: 4 }} />Plinko</>, onClick: () => setSelectedGame('Plinko') },
		{ key: 'SlotMachine', label: <><img src={slotIcon} alt="Slot Machine" style={{ width: 38, marginBottom: 4 }} />Slot Machine 🎰</>, onClick: () => setSelectedGame('SlotMachine'), style: { background: 'linear-gradient(135deg,#f39c12,#e74c3c,#00bfff,#f9e79f)', color: '#fff', fontWeight: 700, boxShadow: '0 0 16px #f39c12' } },
		{ key: 'Sinistar', label: '👹 Sinistar', onClick: () => setSelectedGame('Sinistar') },
		{ key: 'Commando', label: '🪖 Commando', onClick: () => setSelectedGame('Commando') },
		{ key: 'Centipede', label: '🐛 Centipede', onClick: () => setSelectedGame('Centipede') },
		{ key: 'Snake', label: '🐍 Snake', onClick: () => setSelectedGame('Snake') },
		{ key: 'DigDug', label: '👷 Dig Dug', onClick: () => setSelectedGame('DigDug') },
		{ key: 'Galaga', label: '🛸 Galaga', onClick: () => setSelectedGame('Galaga') },
		{ key: 'Joust', label: '🦅 Joust', onClick: () => setSelectedGame('Joust') },
		{ key: 'SpaceInvaders', label: '👾 Space Invaders', onClick: () => setSelectedGame('SpaceInvaders') },
		{ key: 'PaperBoy', label: '🚴 Paper Boy', onClick: () => setSelectedGame('PaperBoy') },
	{ key: 'Qbert', label: '🟡 Q*bert', onClick: () => setSelectedGame('Qbert') },
	{ key: 'Rampage', label: '🦍 Rampage', onClick: () => setSelectedGame('Rampage') },
	{ key: 'StreetFighter', label: '🥋 Street Fighter', onClick: () => setSelectedGame('StreetFighter') },
	{ key: 'RType', label: '🚀 R-Type', onClick: () => setSelectedGame('RType') },
	];

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
			{gameComponent ? (
				gameComponent
			) : (
				<>
					<h2>Arcade Mini-Games</h2>
					{isEventActive && (
						<div style={{ background: '#ffe259', color: '#24308a', borderRadius: 10, padding: '10px 18px', fontWeight: 700, marginBottom: 8, boxShadow: '0 2px 8px #24308a22' }}>
							<span style={{ fontSize: 16 }}>🌞 {eventName}</span>
							<div style={{ fontSize: 13, fontWeight: 400 }}>{eventDesc}</div>
						</div>
					)}
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
						{gameButtons.map(btn => (
							<button
								key={btn.key}
								className="arcade-game"
								style={{ minWidth: 120, minHeight: 80, outline: 'none', boxShadow: '0 0 0 2px #24308a33', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...(btn.style || {}) }}
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
