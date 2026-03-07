"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserStatsChartProps {
  posts: any[];
  darkMode?: boolean;
}

const UserStatsChart = ({ posts, darkMode }: UserStatsChartProps) => {
  const [period, setPeriod] = useState<'all' | 'week'>('week');

  const chartData = useMemo(() => {
    const statsMap: Record<string, { views: number; likes: number }> = {};
    const now = new Date();
    
    if (period === 'week') {
      // 최근 7일 초기화 (데이터 없는 날도 0으로 표시)
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        statsMap[dateStr] = { views: 0, likes: 0 };
      }
    }

    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const dateStr = date.toISOString().split('T')[0];
      
      if (period === 'week') {
        if (statsMap[dateStr]) {
          statsMap[dateStr].views += post.views || 0;
          statsMap[dateStr].likes += post._count?.likes || 0;
        }
      } else {
        if (!statsMap[dateStr]) statsMap[dateStr] = { views: 0, likes: 0 };
        statsMap[dateStr].views += post.views || 0;
        statsMap[dateStr].likes += post._count?.likes || 0;
      }
    });

    return Object.entries(statsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        name: period === 'week' ? date.substring(5) : date,
        fullDate: date,
        ...stats
      }));
  }, [posts, period]);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0);

  if (posts.length === 0) return null;

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className={`p-6 md:p-10 rounded-[2.5rem] border mt-10 transition-all duration-700
      ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-100 shadow-sm'}`}
    >
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-xl font-black tracking-tighter uppercase leading-none">게시물 활동 통계</h3>
          <div className="flex justify-center md:justify-start gap-2">
            <button 
              onClick={() => setPeriod('week')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                ${period === 'week' 
                  ? (darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white') 
                  : (darkMode ? 'bg-white/5 text-zinc-500 hover:bg-white/10' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200')}`}
            >
              최근 일주일
            </button>
            <button 
              onClick={() => setPeriod('all')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                ${period === 'all' 
                  ? (darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white') 
                  : (darkMode ? 'bg-white/5 text-zinc-500 hover:bg-white/10' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200')}`}
            >
              전체 통계
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center md:justify-end gap-6 md:gap-10">
            <div className="flex flex-col items-center md:items-end">
                <span className="text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
                  조회수
                </span>
                <span className="text-xl md:text-2xl font-black tabular-nums">{totalViews.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
                <span className="text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-rose-500" />
                  좋아요
                </span>
                <span className="text-xl md:text-2xl font-black text-rose-500 tabular-nums">{totalLikes.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="h-[150px] md:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              interval={period === 'all' ? (chartData.length > 10 ? Math.floor(chartData.length / 5) : 1) : 0}
              tick={{ fill: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", fontSize: 9, fontBold: 900 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", fontSize: 9, fontBold: 900 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? "#121212" : "#ffffff", 
                border: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                borderRadius: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                fontSize: "12px",
                fontWeight: "900",
                padding: "16px"
              }}
              labelStyle={{ marginBottom: "8px", opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              itemStyle={{ padding: "2px 0" }}
              formatter={(value, name) => [value.toLocaleString(), name === 'views' ? 'VIEWS' : 'LIKES']}
              labelFormatter={(label) => `날짜: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke={darkMode ? "#ffffff" : "#18181b"} 
              strokeWidth={3}
              dot={{ fill: darkMode ? "#ffffff" : "#18181b", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="likes" 
              stroke="#f43f5e" 
              strokeWidth={3}
              dot={{ fill: "#f43f5e", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] font-bold opacity-20 uppercase tracking-widest text-center mt-6">
        * 해당 날짜에 발행된 게시물의 누적 성과 기준
      </p>
    </div>
  );
};

export default UserStatsChart;
