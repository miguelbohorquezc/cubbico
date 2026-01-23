/**
 * @fileoverview Barrel exports para componentes del HeaderV2
 * @module presentation/components/headerV2
 */

// Componentes principales
export { HeaderV2 } from './HeaderV2';
export { SearchBar } from './SearchBar';
export { UserProfile } from './UserProfile';

// Default export
export { HeaderV2 as default } from './HeaderV2';

// Re-exportar tipos relevantes
export type {
  HeaderV2Props,
  SearchBarProps,
  HeaderUserInfo,
} from '../../../shared/types/layoutTypes';

export type {
  UserProfileProps,
  NotificationItem,
  HeaderQuickAction,
} from '../../../shared/types/headerTypes';
