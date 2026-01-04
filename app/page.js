'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateClick, calculateRegen, buyUpgrade, getUpgradeCost, getMaxEnergy, UPGRADES } from './lib/gameLogic';
import { initTelegram } from './lib/telegramUtils';
import { playClick, playStartup, playAchievement, playError } from './lib/soundEngine';
import { X, Trophy, Lock, CheckCircle2 } from 'lucide-react';

// --- A. ACHIEVEMENTS CONFIG ---
const ACHIEVEMENTS_DATA = [
    { id: 'rookie', limit: 1000, title: 'ROOKIE ROLLER', desc: 'Reach 1,000 Timbitas' },
    { id: 'highstakes', limit: 10000, title: 'HIGH STAKES', desc: 'Reach 10,000 Timbitas' },
    { id: 'boss', limit: 50000, title: 'CASINO BOSS', desc: 'Reach 50,000 Timbitas' },
    { id: 'god', limit: 100000, title: 'TIMBA GOD', desc: 'Reach 100,000 Timbitas' }
];

export default function Home() {
    // Game State
    const [balance, setBalance] = useState(0);
    const [maxBalance, setMaxBalance] = useState(0);
    const [energy, setEnergy] = useState(100);
    const [upgrades, setUpgrades] = useState({ multitap: 0, energyTank: 0 });

    // UX State
    const [gameStarted, setGameStarted] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [clicks, setClicks] = useState([]);
    const [hydrated, setHydrated] = useState(false);

    // Gamification State
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [currentAchievement, setCurrentAchievement] = useState(null);

    // Audio State
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Video Ref
    const videoRef = useRef(null);

    // --- INIT & PERSISTENCE ---
    useEffect(() => {
        const tgUser = initTelegram();
        if (tgUser) setUser(tgUser);

        const saveKey = tgUser ? `timba_user_${tgUser.id}` : 'timba_vip_state_v2';
        const saved = localStorage.getItem(saveKey);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setBalance(parsed.balance || 0);
                setMaxBalance(parsed.maxBalance || parsed.balance || 0);
                setUpgrades(parsed.upgrades || { multitap: 0, energyTank: 0 });
                setUnlockedAchievements(parsed.achievements || []);

                const now = Date.now();
                const lastTime = parsed.lastSaveTime || now;
                const elapsedSeconds = (now - lastTime) / 1000;

                setEnergy(current => calculateRegen(parsed.energy || 100, elapsedSeconds, parsed.upgrades));
            } catch (e) {
                console.error('Save Corrupted', e);
            }
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, []);

    // --- AUDIO SINGLETON SETUP ---
    useEffect(() => {
        // Create audio instance only once
        audioRef.current = new Audio('/coinflip.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        // CLEANUP: Stop audio on unmount/refresh
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, []);

    // --- AUDIO PLAYBACK CONTROL ---
    useEffect(() => {
        if (!audioRef.current) return;

        if (gameStarted && !isMuted) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio play blocked:", error);
                });
            }
        } else if (!gameStarted || isMuted) {
            audioRef.current.pause();
        }
    }, [gameStarted, isMuted]);

    // --- LOOPS ---
    useEffect(() => {
        if (!hydrated) return;
        const gameInterval = setInterval(() => {
            setEnergy(prev => calculateRegen(prev, 1, upgrades));
        }, 1000);
        return () => clearInterval(gameInterval);
    }, [hydrated, upgrades]);

    useEffect(() => {
        if (!hydrated) return;
        const saveKey = user ? `timba_user_${user.id}` : 'timba_vip_state_v2';
        const stateToSave = {
            balance, maxBalance, energy, upgrades,
            achievements: unlockedAchievements, lastSaveTime: Date.now()
        };
        localStorage.setItem(saveKey, JSON.stringify(stateToSave));
    }, [balance, maxBalance, energy, upgrades, unlockedAchievements, hydrated, user]);

    const maxEnergy = getMaxEnergy(upgrades);

    // --- ACHIEVEMENTS CHECK ---
    useEffect(() => {
        if (balance > maxBalance) setMaxBalance(balance);
    }, [balance, maxBalance]);

    useEffect(() => {
        if (!hydrated) return;
        ACHIEVEMENTS_DATA.forEach(ach => {
            if (maxBalance >= ach.limit && !unlockedAchievements.includes(ach.id)) {
                setUnlockedAchievements(prev => [...prev, ach.id]);
                setCurrentAchievement(ach);
                playAchievement();
                setTimeout(() => setCurrentAchievement(null), 4000);
            }
        });
    }, [maxBalance, unlockedAchievements, hydrated]);

    // --- ACTIONS ---
    const handleStartGame = () => {
        playStartup();
        setGameStarted(true);
        // Audio playback is handled by useEffect watching gameStarted
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(prev => {
            const newMuted = !prev;
            if (audioRef.current) {
                audioRef.current.muted = newMuted;
            }
            return newMuted;
        });
    };

    const handleClick = useCallback((e) => {
        const result = calculateClick({ energy, balance, upgrades });

        if (result.success) {
            playClick();
            setEnergy(result.newEnergy);
            setBalance(result.newBalance);

            const rect = e.currentTarget.getBoundingClientRect();
            const offsetX = Math.random() * 60 - 30;
            const y = rect.top - 80;

            const clickProfit = result.newBalance - balance;
            const newClick = { id: Date.now(), x: offsetX, y, val: clickProfit };
            setClicks(prev => [...prev, newClick]);

            setTimeout(() => {
                setClicks(prev => prev.filter(c => c.id !== newClick.id));
            }, 700);
        } else {
            playError();
        }
    }, [energy, balance, upgrades]);

    const handleBuy = (upgradeId) => {
        const result = buyUpgrade({ balance, energy, upgrades }, upgradeId);
        if (result.success) {
            setBalance(result.newBalance);
            if (result.newUpgrades) setUpgrades(result.newUpgrades);
            if (result.newEnergy !== undefined) setEnergy(result.newEnergy);
        } else {
            playError();
        }
    };

    if (!hydrated) return <div className="min-h-screen bg-black flex items-center justify-center text-neon-orange font-bold font-mono animate-pulse">LOADING SYSTEM...</div>;

    return (
        <main role="main" className="w-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden font-sans">

            {/* PHONE FRAME CONTAINER - Video and game inside */}
            <div className="game-wrapper">

                {/* BACKGROUND LIGHTS VIDEO - Inside phone frame */}
                <video
                    src="/background-lights.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full z-0"
                    style={{ objectFit: 'fill' }}
                />

                {/* Vignette overlay */}
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)'
                }}></div>

                {/* Floor Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none"></div>

                {/* --- INTRO/HELP SCREEN --- */}
                {(!gameStarted || showInstructions) && (
                    <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center overflow-y-auto py-8">
                        {/* Title */}
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-[80px] rounded-full"></div>
                            <h1 className="relative text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-orange-600 drop-shadow-[0_0_40px_rgba(255,165,0,0.8)] tracking-tight text-center leading-none">
                                TIMBA<br />CLICKER
                            </h1>
                        </div>

                        {/* Bilingual Instructions */}
                        <div className="text-center px-6 max-w-[340px] mb-6">
                            {/* --- SPANISH SECTION --- */}
                            <div className="mb-4 border-b border-white/20 pb-4">
                                <h2 className="text-lg font-bold text-yellow-400 mb-2">🇪🇸 ESPAÑOL</h2>
                                <p className="text-gray-400 text-[10px] mb-3">
                                    Genera ganancias infinitas con cada toque. Acumula fortuna, mejora tu multiplicador y demuestra qué tan rápido puedes hacer crecer tu banco.
                                </p>
                                <ul className="space-y-1 text-left text-xs text-white">
                                    <li>👆 <span className="font-bold text-yellow-400">Toca la moneda</span> para ganar "Timbitas".</li>
                                    <li>🚀 <span className="font-bold text-blue-400">Compra mejoras</span> para multiplicar tus clicks.</li>
                                    <li>🤑 <span className="font-bold text-green-400">Canjea tus Timbitas</span> por <span className="underline decoration-yellow-500 font-black">TIMBAS REALES.</span></li>
                                </ul>
                            </div>

                            {/* --- ENGLISH SECTION --- */}
                            <div>
                                <h2 className="text-lg font-bold text-yellow-400 mb-2">🇺🇸 ENGLISH</h2>
                                <p className="text-gray-400 text-[10px] mb-3">
                                    Generate infinite earnings with every tap. Accumulate fortune, buy upgrades, and prove how fast you can grow your bank.
                                </p>
                                <ul className="space-y-1 text-left text-xs text-white">
                                    <li>👆 <span className="font-bold text-yellow-400">Tap the coin</span> to earn "Timbitas".</li>
                                    <li>🚀 <span className="font-bold text-blue-400">Buy upgrades</span> to multiply your income.</li>
                                    <li>🤑 <span className="font-bold text-green-400">Exchange Timbitas</span> for <span className="underline decoration-yellow-500 font-black">REAL TIMBAS.</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Play/Resume Button */}
                        <button
                            onClick={() => {
                                if (!gameStarted) {
                                    handleStartGame();
                                } else {
                                    setShowInstructions(false);
                                }
                            }}
                            className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl tracking-widest rounded-full shadow-[0_0_30px_rgba(255,165,0,0.6)] hover:shadow-[0_0_50px_rgba(255,165,0,0.8)] hover:scale-105 active:scale-95 transition-all"
                        >
                            {gameStarted ? 'RESUME' : 'PLAY'}
                        </button>
                    </div>
                )}

                {/* --- ACHIEVEMENTS TOAST --- */}
                <div className={`absolute top-32 left-1/2 -translate-x-1/2 z-[80] transition-all duration-500 transform ${currentAchievement ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
                    {currentAchievement && (
                        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-[#ffd700] p-3 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.4)] min-w-[280px]">
                            <div className="p-2 bg-[#ffd700]/20 rounded-full">
                                <Trophy className="text-[#ffd700]" size={20} />
                            </div>
                            <div>
                                <p className="text-[#ffd700] text-[10px] font-bold uppercase tracking-widest leading-none mb-1">UNLOCKED!</p>
                                <p className="text-white font-black text-sm tracking-wide leading-none">{currentAchievement.title}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- GAMEPLAY UI --- */}
                {gameStarted && (
                    <>
                        {/* HELP BUTTON - Top Left */}
                        <button
                            onClick={() => setShowInstructions(true)}
                            aria-label="Open Instructions"
                            className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-xl hover:bg-white/10 active:scale-95 transition-all"
                        >
                            ❔
                        </button>

                        {/* MUTE BUTTON - Top Right */}
                        <button
                            onClick={toggleMute}
                            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                            className="absolute top-4 right-4 z-40 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-xl hover:bg-white/10 active:scale-95 transition-all"
                        >
                            {isMuted ? '🔇' : '🔊'}
                        </button>

                        {/* HEADER UI */}
                        <div className="absolute top-0 left-0 right-0 z-30 pt-8 px-4 flex flex-col items-center gap-2 animate-[slideDown_0.8s_ease-out] pointer-events-none text-white">
                            <div>
                                <span className="text-orange-400 text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-md border border-orange-500/20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md shadow-lg">
                                    {user ? `WELCOME, ${user.first_name}` : 'WELCOME PLAYER'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center mt-1">
                                <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-yellow-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)] filter brightness-110 tracking-tighter">
                                    $ {Math.floor(balance).toLocaleString()}
                                </div>
                            </div>
                            <div className="w-[90%] max-w-[340px] bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl mt-2">
                                <div className="flex justify-between text-[9px] font-bold text-gray-300 px-3 mb-1 opacity-90 tracking-widest">
                                    <span>⚡ HIGH VOLTAGE</span>
                                    <span>{energy}/{maxEnergy}</span>
                                </div>
                                <div className="w-full h-4 bg-gray-900/80 rounded-full overflow-hidden relative shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-600 via-yellow-500 to-white shadow-[0_0_15px_rgba(255,165,0,0.6)] relative"
                                        style={{ width: `${(energy / maxEnergy) * 100}%`, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-40 animate-[shine_1.5s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HIGH-FIDELITY 3D COIN */}
                        <div
                            className="coin-container"
                            onClick={(e) => { if (energy >= 1) handleClick(e); }}
                            role="button"
                            aria-label="Tap coin to earn Timbitas"
                        >
                            <div className="coin-wrapper">
                                {/* Front Face with Texture */}
                                <div className="coin-face front">
                                    <img src="/coin-spin.png" alt="Timba Gold Coin Clicker - Tap to earn" draggable={false} />
                                </div>

                                {/* Solid Gold Body (16 layers for thickness) */}
                                {[...Array(16)].map((_, i) => (
                                    <div
                                        key={`edge-${i}`}
                                        className="coin-edge-layer"
                                        style={{ transform: `translateZ(${7 - i}px)` }}
                                    />
                                ))}

                                {/* Back Face with Texture */}
                                <div className="coin-face back">
                                    <img src="/coin-spin.png" alt="Timba Gold Coin - Back side" draggable={false} />
                                </div>
                            </div>
                        </div>

                        {/* FLOATING NUMBERS */}
                        {clicks.map(c => (
                            <div key={c.id} className="absolute z-50 pointer-events-none animate-[floatUpPop_0.6s_ease-out_forwards] w-full flex justify-center left-0" style={{ top: c.y }}>
                                <span className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] relative" style={{ transform: `translateX(${c.x}px)` }}>
                                    +{c.val}
                                </span>
                            </div>
                        ))}

                        {/* FOOTER UI */}
                        <div className="absolute bottom-8 left-0 right-0 z-30 px-6 flex justify-center gap-4 animate-[slideUp_0.8s_ease-out] pointer-events-none">
                            <div className="w-full max-w-md flex gap-3 pointer-events-auto">
                                <button onClick={() => setIsAchievementsOpen(true)} className="flex-[1] h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg hover:bg-white/10 group">
                                    <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">🏆</span>
                                </button>
                                <button onClick={() => setIsShopOpen(true)} className="flex-[3] h-16 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg hover:bg-white/20 group">
                                    <div className="bg-orange-500/20 p-2 rounded-full group-hover:bg-orange-500/30 transition-colors">
                                        <span className="text-xl drop-shadow-md group-hover:-rotate-12 transition-transform block">🛒</span>
                                    </div>
                                    <span className="text-xs font-black text-white tracking-[0.2em] drop-shadow-sm">OPEN SHOP</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <style jsx global>{`
                    @keyframes floatUpPop { 0% { opacity: 0; transform: translateY(20px) scale(0.5); } 20% { opacity: 1; transform: translateY(-20px) scale(1.1); } 100% { opacity: 0; transform: translateY(-100px) scale(0.9); } }
                    @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    @keyframes shine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
                `}</style>

                {/* MODALS */}
                {isShopOpen && (
                    <div className="absolute inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="w-full h-full sm:h-auto max-h-[80vh] bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                                <h2 className="text-lg font-black text-white tracking-wide italic uppercase">SHOP</h2>
                                <button onClick={() => setIsShopOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                                <ShopItem item={{ ...UPGRADES.multitap, name: 'Double Tap (x2)' }} level={upgrades.multitap || 0} balance={balance} onBuy={() => handleBuy('multitap')} />
                                <ShopItem item={{ ...UPGRADES.energyTank, name: 'Super Battery (+100)' }} level={upgrades.energyTank || 0} balance={balance} onBuy={() => handleBuy('energyTank')} />
                                <ShopItem item={{ ...UPGRADES.fullRefill, name: 'Instant Refill' }} level={0} balance={balance} onBuy={() => handleBuy('fullRefill')} isConsumable />
                            </div>
                        </div>
                    </div>
                )}
                {isAchievementsOpen && (
                    <div className="absolute inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <div className="w-full h-full sm:h-auto max-h-[80vh] bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                                <h2 className="text-lg font-black text-white tracking-wide italic uppercase">TROPHIES</h2>
                                <button onClick={() => setIsAchievementsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                                {ACHIEVEMENTS_DATA.map(ach => {
                                    const isUnlocked = unlockedAchievements.includes(ach.id);
                                    const progress = Math.min((maxBalance / ach.limit) * 100, 100);
                                    return (
                                        <div key={ach.id} className={`p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-[#ffd700]/10 border-[#ffd700]/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${isUnlocked ? 'text-[#ffd700]' : 'text-gray-400'}`}>{ach.title}</h3>
                                                    <p className="text-[10px] text-gray-500 font-medium">{ach.desc}</p>
                                                </div>
                                                {isUnlocked ? <CheckCircle2 size={20} className="text-[#ffd700]" /> : <Lock size={16} className="text-gray-600" />}
                                            </div>
                                            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                <div className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-[#ffd700]' : 'bg-gray-700'}`} style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

function ShopItem({ item, level, balance, onBuy, isConsumable }) {
    const cost = getUpgradeCost(item.id, level);
    const canAfford = balance >= cost;
    return (
        <div className={`p-4 rounded-xl flex items-center justify-between border transition-all ${canAfford ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/5 border-white/5 opacity-50'}`}>
            <div>
                <h3 className="font-bold text-white text-sm">{item.name} <span className="text-neon-orange text-[10px] ml-1">{!isConsumable && `Lvl ${level}`}</span></h3>
                <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>
                <div className="mt-2 text-white font-mono font-bold text-xs bg-black/30 w-fit px-2 py-1 rounded"><span className="text-neon-orange mr-1">$</span>{cost.toLocaleString()}</div>
            </div>
            <button onClick={onBuy} disabled={!canAfford} className={`px-4 py-2 rounded-lg font-bold text-[10px] tracking-widest transition-all ${canAfford ? 'bg-neon-orange text-black hover:bg-white hover:text-black shadow-lg active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>BUY</button>
        </div>
    );
}
