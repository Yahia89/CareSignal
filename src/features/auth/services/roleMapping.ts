import type { UserRole } from '../../../types';
import type { Role } from '../../../shared/types/domain';

/**
 * The auth screens use UI-side role values (`'family' | 'elder'`) that match
 * navigation stacks. The CareSignal API enumerates `'senior' | 'family'`
 * (per the Profile schema and signup endpoint).
 *
 * Mapping:
 *   UI 'elder'   ↔ API 'senior'
 *   UI 'family'  ↔ API 'family'
 */
export const uiRoleToApi = (role: Role): UserRole => (role === 'elder' ? 'senior' : 'family');

export const apiRoleToUi = (role: UserRole): Role => (role === 'senior' ? 'elder' : 'family');
