"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { LuTable, LuCode, LuImage, LuHeading1, LuHeading2, LuHeading3, LuList, LuListOrdered } from 'react-icons/lu';

export interface SuggestionItem {
  title: string;
  description: string;
  command: (props: { editor: any; range: any }) => void;
  icon: React.ReactNode;
}

const SuggestionList = forwardRef((props: { items: SuggestionItem[]; command: any }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="z-50 min-w-[280px] p-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="px-2 py-1.5 mb-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">커맨드</div>
      {props.items.map((item, index) => (
        <button
          key={index}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-all ${
            index === selectedIndex
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/10'
              : 'hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          onClick={() => selectItem(index)}
        >
          <div className={`p-2 rounded-lg ${
            index === selectedIndex ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'
          }`}>
            {item.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">{item.title}</span>
            <span className={`text-[10px] font-medium opacity-60 ${index === selectedIndex ? 'text-white/80' : ''}`}>
              {item.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
});

SuggestionList.displayName = 'SuggestionList';

export default SuggestionList;
