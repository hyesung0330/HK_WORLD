"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import Gapcursor from '@tiptap/extension-gapcursor';
import { createLowlight, common } from 'lowlight';
import SlashCommand, { suggestionItems, renderItems } from './SlashCommand';
import { useEffect } from 'react';
import { uploadImage } from '@/lib/upload';
import {
  LuTrash2, LuPlus,
  LuRectangleHorizontal, LuRectangleVertical,
  LuPaintbrush, LuChevronDown,
  LuPanelTop, LuPanelLeft
} from 'react-icons/lu';

const lowlight = createLowlight(common);

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  darkMode?: boolean;
}

const Editor = ({ content, onChange, darkMode }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: '100%',
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width) return {};
                return {
                  width: attributes.width,
                  style: `width: ${attributes.width}; height: auto; display: block; margin-left: auto; margin-right: auto;`,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-slate-200 dark:border-white/10 my-8 transition-all',
        },
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'notion-table',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'notion-table-header',
        },
      }),
      TableCell.extend({
        addAttributes() {
          return {
            backgroundColor: {
              default: null,
              parseHTML: element => element.style.backgroundColor || null,
              renderHTML: attributes => {
                if (!attributes.backgroundColor) return {};
                return { style: `background-color: ${attributes.backgroundColor}` };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: 'notion-table-cell',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm my-8',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Gapcursor,
      Placeholder.configure({
        placeholder: '당신의 이야기를 적어주세요. "/"를 입력하여 명령어를 확인하세요.',
        emptyEditorClass: 'is-editor-empty',
      }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return suggestionItems.filter(item =>
                item.title.toLowerCase().startsWith(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
          },
          render: renderItems,
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none min-h-[500px] p-4 ${
            darkMode ? 'prose-invert' : ''
        }`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            uploadImage(file).then(url => {
              if (url && editor) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates?.pos || view.state.selection.from, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            uploadImage(file).then(url => {
              if (url && editor) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.setContent("");
    }
  }, [content, editor]);

  const colors = [
    { name: 'None', color: 'transparent' },
    { name: 'Gray', color: darkMode ? '#373737' : '#f1f1ef' },
    { name: 'Brown', color: darkMode ? '#44332b' : '#f4eeee' },
    { name: 'Orange', color: darkMode ? '#594430' : '#faedde' },
    { name: 'Yellow', color: darkMode ? '#595130' : '#fff9e3' },
    { name: 'Green', color: darkMode ? '#354c3b' : '#edf3ec' },
    { name: 'Blue', color: darkMode ? '#28456c' : '#e7f3f8' },
    { name: 'Purple', color: darkMode ? '#493064' : '#f6f3f9' },
    { name: 'Pink', color: darkMode ? '#69314c' : '#faf1f5' },
    { name: 'Red', color: darkMode ? '#59342a' : '#fdebec' },
  ];

  return (
      <div className="relative w-full">
        <style jsx global>{`
          .tiptap .notion-table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 12px 0;
            border: 1px solid ${darkMode ? '#373737' : '#e9e9e7'};
          }
          .tiptap .notion-table-cell, .tiptap .notion-table-header {
            min-width: 1em;
            border: 1px solid ${darkMode ? '#373737' : '#e9e9e7'};
            padding: 7px 9px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
            font-size: 14px;
          }
          .tiptap .notion-table-header {
            background-color: ${darkMode ? '#2f2f2f' : '#f7f7f5'};
            font-weight: 600;
          }
          .tiptap table .selectedCell:after {
            z-index: 2;
            position: absolute;
            content: "";
            left: 0; right: 0; top: 0; bottom: 0;
            background: ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
            pointer-events: none;
          }
          .tiptap table .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: -2px;
            width: 4px;
            background-color: ${darkMode ? '#666' : '#ccc'};
            pointer-events: none;
          }
          .tiptap table p { margin: 0 !important; line-height: 1.5; }
          .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }
        `}</style>

        {editor && (
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 150, offset: [0, 8] }}
                shouldShow={({ editor }) => editor.isActive('table')}
                className={`flex items-center gap-0.5 p-1 rounded-md border shadow-lg ${
                    darkMode ? 'bg-[#252525] border-[#373737]' : 'bg-white border-zinc-200'
                }`}
            >
              <div className="flex items-center gap-0.5 border-r border-zinc-700/30 pr-1 mr-1">
                <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} icon={<LuRectangleVertical size={16} />} title="왼쪽 열 추가" />
                <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} icon={<LuPlus size={14} className="rotate-45" />} title="오른쪽 열 추가" />
                <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} icon={<LuTrash2 size={16} />} title="열 삭제" isDanger />
              </div>

              <div className="flex items-center gap-0.5 border-r border-zinc-700/30 pr-1 mr-1">
                <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()} icon={<LuRectangleHorizontal size={16} />} title="위 행 추가" />
                <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} icon={<LuPlus size={16} />} title="아래 행 추가" />
                <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} icon={<LuTrash2 size={16} />} title="행 삭제" isDanger />
              </div>

              <div className="flex items-center gap-0.5 border-r border-zinc-700/30 pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                    icon={<LuPanelTop size={16} />}
                    isActive={editor.isActive('tableHeaderRow')}
                    title="헤더 행 토글"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                    icon={<LuPanelLeft size={16} />}
                    isActive={editor.isActive('tableHeaderColumn')}
                    title="헤더 열 토글"
                />
              </div>

              <div className="flex items-center gap-0.5">
                <div className="relative group">
                  <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded flex items-center gap-0.5 text-zinc-500">
                    <LuPaintbrush size={16} />
                    <LuChevronDown size={10} />
                  </button>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 rounded-lg border shadow-xl hidden group-hover:grid grid-cols-5 gap-1 ${
                      darkMode ? 'bg-[#252525] border-[#373737]' : 'bg-white border-zinc-200'
                  }`}>
                    {colors.map(c => (
                        <button
                            key={c.name}
                            onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', c.color === 'transparent' ? null : c.color).run()}
                            className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c.color }}
                        />
                    ))}
                  </div>
                </div>
                <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} icon={<LuTrash2 size={16} />} title="표 삭제" isDanger />
              </div>
            </BubbleMenu>
        )}

        {editor && (
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 150, offset: [0, 8] }}
                shouldShow={({ editor }) => editor.isActive('image')}
                className={`flex items-center gap-0.5 p-1 rounded-md border shadow-lg ${
                    darkMode ? 'bg-[#252525] border-[#373737]' : 'bg-white border-zinc-200'
                }`}
            >
              <div className="flex items-center gap-0.5 border-r border-zinc-700/30 pr-1 mr-1">
                <MenuButton 
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()} 
                  icon={<div className="text-[10px] font-bold px-1">25%</div>} 
                  isActive={editor.getAttributes('image').width === '25%'}
                  title="25% 크기" 
                />
                <MenuButton 
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()} 
                  icon={<div className="text-[10px] font-bold px-1">50%</div>} 
                  isActive={editor.getAttributes('image').width === '50%'}
                  title="50% 크기" 
                />
                <MenuButton 
                  onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()} 
                  icon={<div className="text-[10px] font-bold px-1">100%</div>} 
                  isActive={editor.getAttributes('image').width === '100%' || !editor.getAttributes('image').width}
                  title="100% 크기" 
                />
              </div>
              <div className="flex items-center gap-0.5">
                <MenuButton 
                  onClick={() => editor.chain().focus().deleteSelection().run()} 
                  icon={<LuTrash2 size={16} />} 
                  title="이미지 삭제" 
                  isDanger 
                />
              </div>
            </BubbleMenu>
        )}

        <EditorContent editor={editor} />
      </div>
  );
};

// 보조 컴포넌트
interface MenuButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  isDanger?: boolean;
  isActive?: boolean;
}

const MenuButton = ({ onClick, icon, title, isDanger, isActive }: MenuButtonProps) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded transition-colors ${
            isActive ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' :
                isDanger ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
        }`}
    >
      {icon}
    </button>
);

export default Editor;