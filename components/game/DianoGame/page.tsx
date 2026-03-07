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
    const speedRef = useRef(7); // 초기 속도 상향 (6 -> 7)

    const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
    const [score, setScore] = useState(0);
    const [finalXp, setFinalXp] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [dailyGameCount, setDailyGameCount] = useState(0);
    const [loadingCount, setLoadingCount] = useState(true);

    const config = {
        gravity: 0.7, // 중력 상향 (더 묵직한 조작감)
        jumpPower: -13, // 점프력 상향
        groundY: 150,
        playerX: 60,
        baseSpeed: 7,
        maxSpeed: 22, // 최대 속도 대폭 상향
        spawnRate: 80, // 생성 간격 단축
    };

    const gameVars = useRef({
        frameCount: 0,
        obstacles: [] as any[],
        player: { y: config.groundY, vy: 0, width: 35, height: 35, isJumping: false },
        animationId: 0
    });

    useEffect(() => {
        fetchDailyGameCount();
    }, [session]);

    const fetchDailyGameCount = async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/user/game_count');
            const data = await res.json();
            setDailyGameCount(data.dailyGameCount || 0);
        } catch (error) {
            console.error("Failed to fetch game count:", error);
        } finally {
            setLoadingCount(false);
        }
    };

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
        if (dailyGameCount >= 10) {
            toast.error("오늘 플레이 가능한 횟수(10판)를 모두 소진했습니다.");
            return;
        }
        resetGame();
        setGameState('PLAYING');
    };

    const gameOver = useCallback(() => {
        setGameState('GAMEOVER');
        cancelAnimationFrame(gameVars.current.animationId);

        if (scoreRef.current > highScore) setHighScore(scoreRef.current);

        const earnedXp = Math.floor(scoreRef.current / 100) * 10;
        setFinalXp(earnedXp);

        if (earnedXp > 0) handleSaveXp(earnedXp, scoreRef.current);
    }, [highScore, session]);

    const handleSaveXp = async (xp: number, score: number) => {
        if (!session?.user) return;
        const userId = (session.user as any).id;

        try {
            const res = await fetch(`/api/user/${userId}/game_xp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xp, score }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                if (data.dailyGameCount !== undefined) {
                    setDailyGameCount(data.dailyGameCount);
                }
            } else if (data.limitReached) {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("XP 적립 실패:", error);
        }
    };

    const update = () => {
        if (gameState !== 'PLAYING') return;

        const { player, obstacles } = gameVars.current;

        // 1. 가속도 로직 강화: 갈수록 더 빨리 빨라짐
        speedRef.current = Math.min(config.baseSpeed + (scoreRef.current / 600), config.maxSpeed);

        // 2. 중력/점프
        player.vy += config.gravity;
        player.y += player.vy;

        if (player.y > config.groundY) {
            player.y = config.groundY;
            player.vy = 0;
            player.isJumping = false;
        }

        // 3. 장애물 생성 (까마귀 포함)
        gameVars.current.frameCount++;

        // 점수가 높을수록 생성 속도 빨라짐
        const dynamicSpawnRate = Math.max(25, config.spawnRate - Math.floor(scoreRef.current / 400) * 4);

        if (gameVars.current.frameCount % dynamicSpawnRate === 0) {
            const isBird = scoreRef.current > 1500 && Math.random() > 0.65; // 1500점 이후부터 까마귀 등장

            if (isBird) {
                // 공중 장애물 (까마귀)
                const birdHeight = 25;
                const birdY = config.groundY - (Math.random() > 0.5 ? 50 : 90); // 낮은 비행 혹은 높은 비행
                obstacles.push({
                    x: 850,
                    y: birdY,
                    width: 40,
                    height: birdHeight,
                    type: 'BIRD',
                    wingPhase: 0
                });
            } else {
                // 지상 장애물 (선인장 등)
                const height = 35 + Math.random() * 35;
                obstacles.push({
                    x: 850,
                    y: config.groundY + (35 - height),
                    width: 25,
                    height: height,
                    type: 'CACTUS'
                });
            }
        }

        // 4. 장애물 이동 및 충돌
        obstacles.forEach((obs, index) => {
            obs.x -= speedRef.current;
            if (obs.type === 'BIRD') obs.wingPhase += 0.2; // 날개짓 애니메이션용

            // 충돌 감지 (Y축 보정 포함)
            const playerBox = { x: config.playerX + 5, y: player.y + 5, w: player.width - 10, h: player.height - 10 };
            const obsBox = { x: obs.x + 4, y: obs.y + 4, w: obs.width - 8, h: obs.height - 8 };

            if (
                playerBox.x < obsBox.x + obsBox.w &&
                playerBox.x + playerBox.w > obsBox.x &&
                playerBox.y < obsBox.y + obsBox.h &&
                playerBox.y + playerBox.h > obsBox.y
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

        // 플레이어
        const { player } = gameVars.current;
        const playerGrad = ctx.createLinearGradient(config.playerX, player.y, config.playerX, player.y + player.height);
        playerGrad.addColorStop(0, '#818cf8');
        playerGrad.addColorStop(1, '#6366f1');

        ctx.fillStyle = playerGrad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
        ctx.beginPath();
        ctx.roundRect(config.playerX, player.y, player.width, player.height, 8);
        ctx.fill();

        // 장애물 그리기
        gameVars.current.obstacles.forEach(obs => {
            if (obs.type === 'BIRD') {
                // 까마귀 디자인 (보라색/자주색 사이버틱 윙)
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
                ctx.fillStyle = '#a855f7';

                // 날개짓 효과
                const wingY = Math.sin(obs.wingPhase) * 10;
                ctx.beginPath();
                ctx.moveTo(obs.x, obs.y + obs.height / 2);
                ctx.lineTo(obs.x + obs.width / 2, obs.y + wingY);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height / 2);
                ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height - wingY);
                ctx.fill();
            } else {
                // 기존 지상 장애물 (레드)
                ctx.shadowBlur = 12;
                ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
                const obsGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
                obsGrad.addColorStop(0, '#f87171');
                obsGrad.addColorStop(1, '#ef4444');
                ctx.fillStyle = obsGrad;
                ctx.beginPath();
                ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
                ctx.fill();
            }
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

            <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h2 className="text-2xl font-[900] tracking-tighter uppercase">사이버 런</h2>
                    </div>
                    {/*<p className={`text-[10px] font-black tracking-widest uppercase opacity-40`}>*/}
                    {/*    위험도 레벨: <span className="text-rose-500">{Math.floor(speedRef.current - 6)}</span>*/}
                    {/*</p>*/}
                </div>

                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase flex items-center justify-end gap-1">
                            오늘 플레이
                        </p>
                        <p className={`text-xl font-black tabular-nums ${dailyGameCount >= 10 ? 'text-rose-500' : ''}`}>
                            {dailyGameCount} / 10
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase flex items-center justify-end gap-1">
                            <Trophy size={10} /> 최고 점수
                        </p>
                        <p className="text-xl font-black tabular-nums">{highScore}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black opacity-30 uppercase flex items-center justify-end gap-1 text-indigo-500">
                            <Zap size={10} fill="currentColor" /> 현재 점수
                        </p>
                        <p className="text-3xl font-black text-indigo-500 tabular-nums leading-none">{score}</p>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-black/40 h-[420px] border border-transparent group-hover:border-indigo-500/20 transition-all cursor-pointer"
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
                                    <h3 className="text-2xl font-black mb-1">사이버 런</h3>
                                    <p className="text-xs opacity-50 mb-8 font-bold tracking-widest uppercase">클릭해서 시작해보세요</p>
                                    <Button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-white text-black hover:bg-indigo-500 hover:text-white font-black rounded-full px-10 py-6 transition-all">
                                        시작하기
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-2 text-gray-50 flex flex-col items-center">
                                        <h3 className="text-5xl font-black tracking-tighter mb-2">GAME OVER</h3>
                                        <div className="h-1 w-20 bg-red-500/30 rounded-full mb-4" />
                                    </div>
                                    <div className="flex gap-10 mb-8 text-center">
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 uppercase">획득 경험치</p>
                                            <p className="text-2xl font-black text-indigo-400">+{finalXp}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold opacity-40 uppercase">최종 점수</p>
                                            <p className="text-2xl font-black">{score}</p>
                                        </div>
                                    </div>
                                    <Button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-indigo-500 hover:bg-indigo-600 font-black rounded-full px-10 py-6 shadow-lg shadow-indigo-500/20">
                                        <RefreshCw size={18} className="mr-1" />다시하기
                                    </Button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-center items-center px-2">
                <div className="flex items-center gap-2">
                    <div className="px-2 h-5 rounded border flex items-center justify-center text-[9px] font-black bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/20">
                        SPACE
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        또는 터치로 게임을 플레이하세요
                    </span>
                </div>
            </div>
        </div>
    );
}