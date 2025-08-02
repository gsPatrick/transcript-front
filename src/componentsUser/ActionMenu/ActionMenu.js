'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ActionMenu.module.css';
import { FiMoreVertical } from 'react-icons/fi';

export default function ActionMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className={styles.actionMenu} ref={menuRef}>
      <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
        <FiMoreVertical />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {children}
        </div>
      )}
    </div>
  );
}