import { useState } from "react";

const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado del sidebar
  const [activeSubmenu, setActiveSubmenu] = useState(null); // Submenú activo

  // Alterna la apertura/cierre del sidebar
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Alterna la expansión del submenú
  const toggleSubmenu = (menuName: any) => {
    setActiveSubmenu((prev) => (prev === menuName ? null : menuName));
  };

  return {
    isOpen,
    activeSubmenu,
    toggleSidebar,
    toggleSubmenu,
  };
};

export default useSidebar;
