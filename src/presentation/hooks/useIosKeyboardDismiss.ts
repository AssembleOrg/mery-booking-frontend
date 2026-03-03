import { useEffect } from 'react';

export const useIosKeyboardDismiss = () => {
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-ios-keep-keyboard]')) return;

      // Excluir dropdowns de Mantine para permitir scroll y selección
      if (
        target.closest('.mantine-Popover-dropdown') ||
        target.closest('.mantine-Combobox-dropdown') ||
        target.closest('.mantine-Select-dropdown') ||
        target.closest('.mantine-Combobox-options') ||
        target.closest('[data-mantine-stop-propagation]')
      ) {
        return;
      }

      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return;

      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        active.isContentEditable
      ) {
        active.blur();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, []);
};

