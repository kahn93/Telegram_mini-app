
import React, { useState, useEffect } from 'react';

import { logEvent } from '../analytics';
import styles from './Tasks.module.scss';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { RECEIVER_WALLET } from '../Database/tonWallet';
import { tasksList } from './tasksData';

export type Task = {
	id: number;
	title: string;
	desc: string;
	reward: number;
	link?: string;
	icon?: string;
};

type TasksProps = {
	tasks?: Task[];
};

const Tasks: React.FC<TasksProps> = ({ tasks }) => {
	const [completed, setCompleted] = useState<{ [id: number]: boolean }>({});
	const [checkInDone, setCheckInDone] = useState(false);
	const [checkInLoading, setCheckInLoading] = useState(false);
	const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [checkInMsg, setCheckInMsg] = useState('');
	const [tonConnectUI] = useTonConnectUI();
	const wallet = useTonWallet();
	// Streak and weekly quest state
	const [streak, setStreak] = useState(0);
	const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
	const [weeklyProgress, setWeeklyProgress] = useState(0);
	const WEEKLY_GOAL = 7;

	// Load streak and weekly progress from localStorage
	useEffect(() => {
		const streakVal = parseInt(localStorage.getItem('dailyStreak') || '0', 10);
		const last = parseInt(localStorage.getItem('lastCheckIn') || '0', 10);
		const weekly = parseInt(localStorage.getItem('weeklyProgress') || '0', 10);
		setStreak(streakVal);
		setLastCheckIn(last || null);
		setWeeklyProgress(weekly);
	}, []);


	// TON wallet payment for daily check-in
			const handleDailyCheckIn = async () => {
				setCheckInLoading(true);
				setCheckInStatus('idle');
				setCheckInMsg('');
				try {
					await tonConnectUI.sendTransaction({
						validUntil: Math.floor(Date.now() / 1000) + 360,
						messages: [
							{
								address: RECEIVER_WALLET,
								amount: (0.5 * 1e9).toString(), // 0.5 TON in nanoTON
							},
						],
					});
					setCheckInDone(true);
					setCheckInStatus('success');
					setCheckInMsg('✅ Daily check-in successful! +1,000,000 coins awarded.');
					// Streak logic
					const today = new Date();
					const todayDay = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
					let newStreak = streak;
					if (lastCheckIn && todayDay - lastCheckIn === 1) {
						newStreak = streak + 1;
					} else if (!lastCheckIn || todayDay - lastCheckIn > 1) {
						newStreak = 1;
					}
					setStreak(newStreak);
					setLastCheckIn(todayDay);
					localStorage.setItem('dailyStreak', newStreak.toString());
					localStorage.setItem('lastCheckIn', todayDay.toString());
					// Weekly quest progress
					let newWeekly = weeklyProgress + 1;
					if (newWeekly > WEEKLY_GOAL) newWeekly = 1;
					setWeeklyProgress(newWeekly);
					localStorage.setItem('weeklyProgress', newWeekly.toString());
					// Log analytics event
					const userId = localStorage.getItem('userId') || 'unknown';
					await logEvent(userId, 'daily_checkin', { amountTon: 0.5, reward: 1000000 });
				} catch (e: unknown) {
					let msg = 'Transaction cancelled or failed.';
					if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
						msg += `\n${(e as { message: string }).message}`;
					}
					setCheckInStatus('error');
					setCheckInMsg(msg);
				}
				setCheckInLoading(false);
			};

	const handleTaskComplete = (id: number) => {
		setCompleted((prev) => ({ ...prev, [id]: true }));
		// TODO: Add coin reward logic
	};

	const taskList = (tasks ?? tasksList) as Task[];

			return (
				<div className={styles.tasksPage}>
					<div className={styles.dailyCheckInContainer}>
						<div style={{ color: '#000', fontWeight: 600, marginBottom: 4 }}>Daily Check-In</div>
						<div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
							<b>Streak:</b> {streak} days
						</div>
						<div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
							<b>Weekly Quest:</b> {weeklyProgress} / {WEEKLY_GOAL} check-ins
							{weeklyProgress === WEEKLY_GOAL && <span style={{ color: '#1bbf4c', fontWeight: 700, marginLeft: 8 }}>🎉 Weekly Reward!</span>}
						</div>
						{wallet ? (
							<button
								className={styles.dailyCheckInBtn}
								onClick={handleDailyCheckIn}
								disabled={checkInDone || checkInLoading}
							>
								{checkInLoading ? 'Processing...' : checkInDone ? 'Checked In Today' : 'Daily Check-In (0.5 TON → 1,000,000 coins)'}
							</button>
						) : (
							<TonConnectButton />
						)}
						{checkInMsg && (
							<div
								style={{
									marginTop: 8,
									color:
										checkInStatus === 'success'
											? '#00b894'
											: checkInStatus === 'error'
											? '#d63031'
											: '#222',
									fontWeight: 600,
									minHeight: 20,
									animation:
										checkInStatus === 'success'
											? 'popSuccess 0.5s'
											: checkInStatus === 'error'
											? 'popError 0.5s'
											: undefined,
									transition: 'color 0.2s',
								}}
							>
								{checkInMsg}
							</div>
						)}
						<style>{`
							@keyframes popSuccess {
								0% { transform: scale(1); }
								50% { transform: scale(1.15); }
								100% { transform: scale(1); }
							}
							@keyframes popError {
								0% { transform: scale(1); }
								50% { transform: scale(1.1); }
								100% { transform: scale(1); }
							}
						`}</style>
					</div>
					<div className={styles.tasksTitle}>Telegram & Social Tasks</div>
					<div className={styles.tasksList}>
						{taskList.map((task: Task) => (
							<div key={task.id} className={styles.taskCard + (completed[task.id] ? ' ' + styles.completed : '')}>
								<div className={styles.taskHeader}>
									{task.icon && <img src={task.icon} alt={task.title} style={{ width: 22, marginRight: 6, verticalAlign: 'middle' }} />}
									<span className={styles.taskTitle}>{task.title}</span>
									<span className={styles.taskReward}>+{task.reward.toLocaleString()} coins</span>
								</div>
								<div className={styles.taskDesc}>{task.desc}</div>
								<div className={styles.taskActions}>
									{task.link && (
										<a href={task.link} target="_blank" rel="noopener noreferrer" className={styles.taskLink}>
											Go
										</a>
									)}
									<button
										className={styles.completeBtn}
										onClick={() => handleTaskComplete(task.id)}
										disabled={completed[task.id]}
										aria-label={completed[task.id] ? `Task ${task.title} completed` : `Mark task ${task.title} as done`}
										tabIndex={0}
										onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleTaskComplete(task.id); }}
										onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #24308a'}
										onBlur={e => e.currentTarget.style.boxShadow = 'none'}
									>
										{completed[task.id] ? 'Completed' : 'Mark as Done'}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			);
};

export default Tasks;
