"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from "@/app/context/darkmood";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trophy, Zap, RefreshCw, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DinoGame() {
    const { darkMode } = useTheme();
    const { data: session } = useSession();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scoreRef = useRef(0);
    const speedRef = useRef(6); // 초기 속도

    const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
    const [score, setScore] = useState(0);
    const [finalXp, setFinalXp] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const config = {
        gravity: 0.6,
        jumpPower: -12,
        groundY: 150,
        playerX: 60,
        baseSpeed: 6,
        maxSpeed: 15, // 최대 속도 제한
        spawnRate: 90,
    };

    // 가변 변수 (Ref 사용으로 리렌더링 방지 및 성능 확보)
    const gameVars = useRef({
        frameCount: 0,
        obstacles: [] as any[],
        player: { y: config.groundY, vy: 0, width: 35, height: 35, isJumping: false },
        animationId: 0
    });

    const resetGame = () => {
        gameVars.current.obstacles = [];
        gameVars.current.player = { y: config.groundY, vy: 0, width: 35, height: 35, isJumping: false };
        gameVars.current.frameCount = 0;
        scoreRef.current = 0;
        speedRef.current = config.baseSpeed;
        setScore(0);
        setFinalXp(0);
    };

    const startGame = () => {
        resetGame();
        setGameState('PLAYING');
    };

    const gameOver = useCallback(() => {
        setGameState('GAMEOVER');
        cancelAnimationFrame(gameVars.current.animationId);

        if (scoreRef.current > highScore) setHighScore(scoreRef.current);

        const earnedXp = Math.min(Math.floor(scoreRef.current / 1000) * 100, 100000);
        setFinalXp(earnedXp);

        if (earnedXp > 0) handleSaveXp(earnedXp);
    }, [highScore]);

    const handleSaveXp = async (xp: number) => {
        if (!session?.user) return;
        const userId = (session.user as any).id;

        try {
            await fetch(`/api/user/${userId}/game_xp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xp }),
            });
            toast.success(`${xp} XP가 적립되었습니다!`);
        } catch (error) {
            console.error("XP 적립 실패:", error);
        }
    };

    const update = () => {
        if (gameState !== 'PLAYING') return;

        const { player, obstacles } = gameVars.current;

        // 1. 가속도 로직: 500점마다 속도 0.5 증가
        speedRef.current = Math.min(config.baseSpeed + (scoreRef.current / 1000), config.maxSpeed);

        // 2. 중력/점프
        player.vy += config.gravity;
        player.y += player.vy;

        if (player.y > config.groundY) {
            player.y = config.groundY;
            player.vy = 0;
            player.isJumping = false;
        }

        // 3. 장애물 생성 (속도에 따라 생성 간격 조절)
        gameVars.current.frameCount++;
        const currentSpawnRate = Math.max(40, config.spawnRate - Math.floor(scoreRef.current / 500) * 5);

        if (gameVars.current.frameCount % currentSpawnRate === 0) {
            const height = 30 + Math.random() * 30; // 장애물 높이 다양화
            obstacles.push({ x: 850, width: 25, height: height });
        }

        // 4. 장애물 이동 및 충돌
        obstacles.forEach((obs, index) => {
            obs.x -= speedRef.current;

            // 히트박스 보정 (디자인 대비 약간 여유있게)
            if (
                config.playerX + 5 < obs.x + obs.width &&
                config.playerX + player.width - 5 > obs.x &&
                player.y + 5 < config.groundY + obs.height &&
                player.y + player.height - 5 > config.groundY
            ) {
                gameOver();
            }

            if (obs.x + obs.width < 0) {
                obstacles.splice(index, 1);
                scoreRef.current += 100;
                setScore(scoreRef.current);
            }
        });

        draw();
        gameVars.current.animationId = requestAnimationFrame(update);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 바닥 Glow 라인
        ctx.shadowBlur = 10;
        ctx.shadowColor = darkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.2)';
        ctx.strokeStyle = darkMode ? '#312e81' : '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 185);
        ctx.lineTo(canvas.width, 185);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 플레이어 (네온 스타일 사각형)
        const { player } = gameVars.current;
        const playerGrad = ctx.createLinearGradient(config.playerX, player.y, config.playerX, player.y + player.height);
        playerGrad.addColorStop(0, '#818cf8');
        playerGrad.addColorStop(1, '#6366f1');

        ctx.fillStyle = playerGrad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
        // 둥근 사각형 그리기
        ctx.beginPath();
        ctx.roundRect(config.playerX, player.y, player.width, player.height, 8);
        ctx.fill();

        // 장애물 (에너제틱 레드)
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        gameVars.current.obstacles.forEach(obs => {
            const obsGrad = ctx.createLinearGradient(obs.x, 185 - obs.height, obs.x, 185);
            obsGrad.addColorStop(0, '#f87171');
            obsGrad.addColorStop(1, '#ef4444');
            ctx.fillStyle = obsGrad;
            ctx.beginPath();
            ctx.roundRect(obs.x, 185 - obs.height, obs.width, obs.height, 4);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    };

    const handleJump = useCallback(() => {
        if (gameState === 'PLAYING' && !gameVars.current.player.isJumping) {
            gameVars.current.player.vy = config.jumpPower;
            gameVars.current.player.isJumping = true;
        } else if (gameState !== 'PLAYING') {
            startGame();
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            gameVars.current.animationId = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(gameVars.current.animationId);
    }, [gameState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); handleJump(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump]);

    return (
        <div className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 
            ${darkMode ? 'bg-zinc-900/40 border-white/5 hover:border-indigo-500/30' : 'bg-white border-slate-200 shadow-2xl shadow-indigo-500/5'}`}>

            {/* 상단 정보 영역 */}
            <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h2 className="text-2xl font-[900] tracking-tighter uppercase italic">Cyber Run</h2>
                    </div>
                    <p className={`text-[10px] font-black tracking-widest uppercase opacity-40`}>
                        Difficulty: <span className="text-indigo-500">{Math.floor(speedRef.current * 10) / 10}x</span>
                    </p>
                </div>

                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase flex items-center justify-end gap-1">
                            <Trophy size={10} /> High Score
                        </p>
                        <p className="text-xl font-black tabular-nums">{highScore}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase flex items-center justify-end gap-1 text-indigo-500">
                            <Zap size={10} fill="currentColor" /> Current
                        </p>
                        <p className="text-3xl font-black text-indigo-500 tabular-nums leading-none">{score}</p>
                    </div>
                </div>
            </div>

            {/* 게임 캔버스 영역 */}
            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-black/40 h-[220px] border border-transparent group-hover:border-indigo-500/20 transition-all cursor-pointer"
                 onClick={handleJump}>
                <canvas ref={canvasRef} width={800} height={220} className="w-full h-full" />

                <AnimatePresence>
                    {gameState !== 'PLAYING' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6"
                        >
                            {gameState === 'READY' ? (
                                <>
                                    <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                                        <Play fill="white" size={32} className="ml-1" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">SYSTEM READY</h3>
                                    <p className="text-xs opacity-50 mb-8 font-bold tracking-widest uppercase">Space or Click to Start</p>
                                    <Button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-white text-black hover:bg-indigo-500 hover:text-white font-black rounded-full px-10 py-6 transition-all">
                                        INITIALIZE
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-2 text-red-500 flex flex-col items-center">
                                        <h3 className="text-5xl font-black tracking-tighter mb-2">CRASHED</h3>
                                        <div className="h-1 w-20 bg-red-500/30 rounded-full mb-4" />
                                    </div>
                                    <div className="flex gap-10 mb-8 text-center">
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 uppercase">Earned XP</p>
                                            <p className="text-2xl font-black text-indigo-400">+{finalXp}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 uppercase">Final Score</p>
                                            <p className="text-2xl font-black">{score}</p>
                                        </div>
                                    </div>
                                    <Button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-indigo-500 hover:bg-indigo-600 font-black rounded-full px-10 py-6 shadow-lg shadow-indigo-500/20">
                                        <RefreshCw size={18} className="mr-2" /> REBOOT SYSTEM
                                    </Button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 하단 팁 */}
            <div className="mt-6 flex justify-between items-center px-2">
                <p className="text-[10px] font-bold opacity-30 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-current" />
                    SPEED INCREASES EVERY 1000 POINTS
                </p>
                <div className="flex gap-2">
                    {['W', 'A', 'S', 'D'].map(k => (
                        <div key={k} className={`w-5 h-5 rounded border flex items-center justify-center text-[8px] font-black ${darkMode ? 'border-white/10 opacity-20' : 'border-black/10 opacity-30'}`}>{k}</div>
                    ))}
                    <div className="px-3 h-5 rounded border flex items-center justify-center text-[8px] font-black bg-indigo-500 text-white border-indigo-500">SPACE</div>
                </div>
            </div>
        </div>
    );
}