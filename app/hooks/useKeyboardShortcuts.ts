import { useEffect, useRef } from 'react';

interface KeyboardShortcutDeps {
  menuVisible: boolean;
  setMenuVisible: (v: boolean) => void;
  setMenuPosition: (pos: { x: number; y: number }) => void;
  setSelectedSidebarNodeId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveNodeGraph: () => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;
  groupSelection: () => void;
}

export function useKeyboardShortcuts(deps: KeyboardShortcutDeps) {
  const {
    menuVisible,
    setMenuVisible,
    setMenuPosition,
    setSelectedSidebarNodeId,
    undo,
    redo,
    saveNodeGraph,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    groupSelection,
  } = deps;

  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' ||
                      (e.target as HTMLElement).tagName === 'TEXTAREA' ||
                      (e.target as HTMLElement).tagName === 'SELECT';

      if (e.key === 'Tab' && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        if (menuVisible) {
          setMenuVisible(false);
        } else {
          setMenuPosition(mousePos.current);
          setMenuVisible(true);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); saveNodeGraph(); }
        if (e.key === 'c' && !isInput) { e.preventDefault(); copySelection(); }
        if (e.key === 'v' && !isInput) { e.preventDefault(); pasteClipboard(); }
        if (e.key === 'd' && !isInput) { e.preventDefault(); duplicateSelection(); }
        if (e.key === 'g' && !isInput) { e.preventDefault(); groupSelection(); }
      }
      if (e.key === 'Escape') { setMenuVisible(false); setSelectedSidebarNodeId(null); }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [menuVisible, setMenuPosition, setMenuVisible, undo, redo, saveNodeGraph, setSelectedSidebarNodeId, copySelection, pasteClipboard, duplicateSelection, groupSelection]);
}
