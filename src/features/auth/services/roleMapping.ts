import type { UserRole } from '../../../types';
import type { Role } from '../../../shared/types/domain';

/**
 * The auth screens use UI-side role values (`'family' | 'elder'`) that match
 * navigation stacks. The API uses `'senior' | 'caregiver' | 'admin'`. These
 * helpers keep the mapping in one place so we don't leak the inconsistency
 * into screens.
 *
 * Mapping:
 *   UI 'elder'   ↔ API 'senior'
 *   UI 'family'  ↔ API 'caregiver'
 *
 * (`admin` has no UI counterpart yet — added if/when needed.)
 */
export const uiRoleToApi = (role: Role): UserRole => (role === 'elder' ? 'senior' : 'caregiver');

export const apiRoleToUi = (role: UserRole): Role => (role === 'senior' ? 'elder' : 'family');
