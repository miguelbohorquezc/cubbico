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
