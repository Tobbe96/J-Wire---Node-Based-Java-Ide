import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

export interface ContextMenuState {
  menuVisible: boolean;
  menuPosition: { x: number; y: number };
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setMenuPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
}

export function useContextMenu(): ContextMenuState {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setMenuPosition({ x: mousePos.current.x, y: mousePos.current.y });
        setMenuVisible(prev => !prev);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { menuVisible, menuPosition, setMenuVisible, setMenuPosition };
}
