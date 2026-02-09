/**
 * UI Components
 *
 * Barrel export for reusable UI components built with Tailwind CSS.
 * These components follow the institutional design system and provide
 * consistent styling, accessibility, and type safety across the application.
 *
 * @module presentation/components/ui
 */

// Input component
export { default as Input } from './Input';
export type { InputProps } from './Input';

// Button component
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// FormError component
export { default as FormError } from './FormError';
export type { FormErrorProps, FormErrorVariant } from './FormError';

// Select component
export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Label component
export { default as Label } from './Label';
export type { LabelProps, LabelSize } from './Label';

// Badge component
export { default as Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

// Card component
export { default as Card } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardElevation } from './Card';

// Tabs component
export { default as Tabs } from './Tabs';
export type { TabsProps, TabsListProps, TabProps, TabPanelProps } from './Tabs';

// EmptyState component
export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateVariant } from './EmptyState';

// ProgressBar component
export { default as ProgressBar } from './ProgressBar';
export type { ProgressBarProps, ProgressBarVariant } from './ProgressBar';

// SearchInput component
export { default as SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

// ConfirmModal component
export { default as ConfirmModal } from './ConfirmModal';
