"use client";

import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SuggestionList, { SuggestionItem } from './SuggestionList';
import { LuHeading1, LuHeading2, LuHeading3, LuList, LuListOrdered, LuTable, LuCode, LuImage, LuQuote } from 'react-icons/lu';
import { uploadImage } from '@/lib/upload';

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const suggestionItems = [
  {
    title: '제목 1',
    description: '가장 큰 제목',
    icon: <LuHeading1 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: '제목 2',
    description: '중간 크기 제목',
    icon: <LuHeading2 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: '제목 3',
    description: '작은 크기 제목',
    icon: <LuHeading3 size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: '할 일 목록',
    description: '순서 없는 리스트',
    icon: <LuList size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: '숫자 목록',
    description: '순서 있는 리스트',
    icon: <LuListOrdered size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: '인용문',
    description: '중요한 문장 인용',
    icon: <LuQuote size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: '코드 블록',
    description: '코드 스니펫 추가',
    icon: <LuCode size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: '표 추가',
    description: '3x3 표를 생성합니다',
    icon: <LuTable size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: '이미지 업로드',
    description: '이미지를 첨부합니다',
    icon: <LuImage size={18} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).run();
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const url = await uploadImage(file);
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }
      };
      input.click();
    },
  },
];

export const renderItems = () => {
  let component: any;
  let popup: any;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SuggestionList, {
        props,
        editor: props.editor,
      });

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: any) {
      component.updateProps(props);

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },

    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};

export default SlashCommand;
