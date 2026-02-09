import React, { createContext, useContext, useState, ReactNode } from 'react';
import PropTypes from 'prop-types';
import Badge from './Badge';

/**
 * Context for managing tabs state
 */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

/**
 * Hook to access tabs context
 */
const useTabsContext = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return context;
};

/**
 * Props for the Tabs component
 */
export interface TabsProps {
  /**
   * Tabs content (should contain Tabs.List and Tabs.Panel components)
   */
  children: ReactNode;

  /**
   * Default active tab value
   */
  defaultValue: string;

  /**
   * Callback when tab changes
   */
  onChange?: (value: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Props for TabsList component
 */
export interface TabsListProps {
  /**
   * List content (should contain Tabs.Tab components)
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Props for Tab component
 */
export interface TabProps {
  /**
   * Tab value (identifier)
   */
  value: string;

  /**
   * Tab label
   */
  children: ReactNode;

  /**
   * Optional icon
   */
  icon?: ReactNode;

  /**
   * Optional badge count
   */
  badge?: number | string;

  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Props for TabPanel component
 */
export interface TabPanelProps {
  /**
   * Panel value (must match a Tab value)
   */
  value: string;

  /**
   * Panel content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TabsList Component
 */
const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  const listClasses = `
    flex
    items-center
    gap-2
    border-b
    border-light-gray-200
    mb-6
    overflow-x-auto
    scrollbar-thin
    p-1
    -m-1
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={listClasses} role="tablist">
      {children}
    </div>
  );
};

TabsList.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
};

/**
 * Tab Component
 */
const Tab: React.FC<TabProps> = ({
  value,
  children,
  icon,
  badge,
  disabled = false,
  className = '',
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setActiveTab(value);
    }
  };

  // Base tab classes
  const baseClasses = `
    relative
    flex
    items-center
    justify-center
    gap-2
    px-5
    py-3
    text-sm
    font-semibold
    border-b-2
    transition-all
    duration-200
    cursor-pointer
    outline-none
    focus-visible:ring-2
    focus-visible:ring-deep-blue-400
    focus-visible:ring-inset
    rounded-t-lg
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Active/inactive states
  const stateClasses = isActive
    ? `
      text-deep-blue-700
      border-deep-blue-600
      bg-deep-blue-50
    `.replace(/\s+/g, ' ').trim()
    : `
      text-light-gray-600
      border-transparent
      hover:text-deep-blue-600
      hover:bg-light-gray-50
    `.replace(/\s+/g, ' ').trim();

  // Disabled state
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  const tabClasses = `${baseClasses} ${stateClasses} ${disabledClasses}`;

  // Clone icon with proper sizing classes
  const iconWithClasses = icon && React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
        className: `w-4 h-4 ${isActive ? 'text-deep-blue-600' : 'text-light-gray-500'}`,
      })
    : icon;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={tabClasses}
      type="button"
    >
      {/* Icon */}
      {iconWithClasses}

      {/* Label */}
      <span>{children}</span>

      {/* Badge */}
      {badge !== undefined && badge !== null && (
        <Badge
          variant={isActive ? 'blue' : 'default'}
          size="sm"
          className="ml-1"
        >
          {badge}
        </Badge>
      )}
    </button>
  );
};

Tab.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  icon: PropTypes.any,
  badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * TabPanel Component
 */
const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '' }) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) {
    return null;
  }

  const panelClasses = `
    animate-fadeIn
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div role="tabpanel" tabIndex={0} className={panelClasses}>
      {children}
    </div>
  );
};

TabPanel.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
};

/**
 * Tabs Component
 *
 * A reusable tabs component with support for icons, badges, and smooth transitions.
 * Follows accessibility best practices (ARIA roles, keyboard navigation).
 *
 * @example
 * ```tsx
 * // Basic tabs
 * <Tabs defaultValue="tab1">
 *   <Tabs.List>
 *     <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
 *     <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
 *   <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
 * </Tabs>
 * ```
 *
 * @example
 * ```tsx
 * // Tabs with icons and badges
 * <Tabs defaultValue="propósito1" onChange={handleChange}>
 *   <Tabs.List>
 *     <Tabs.Tab value="propósito1" icon={<TargetIcon />} badge={5}>
 *       Propósito 1
 *     </Tabs.Tab>
 *     <Tabs.Tab value="propósito2" icon={<TargetIcon />} badge={3}>
 *       Propósito 2
 *     </Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="propósito1">...</Tabs.Panel>
 *   <Tabs.Panel value="propósito2">...</Tabs.Panel>
 * </Tabs>
 * ```
 */
const Tabs: React.FC<TabsProps> & {
  List: typeof TabsList;
  Tab: typeof Tab;
  Panel: typeof TabPanel;
} = ({ children, defaultValue, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const contextValue: TabsContextValue = {
    activeTab,
    setActiveTab: handleTabChange,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

// Attach sub-components
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// PropTypes for runtime validation
Tabs.propTypes = {
  children: PropTypes.any.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default Tabs;
