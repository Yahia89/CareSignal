import apiClient from './api';
import { GenerateInviteResponse } from '../types';

export const linksService = {
  /**
   * Generate invite code/link
   * POST /api/links/generate-invite
   *
   * Response:
   * {
   *   "data": {
   *     "invite_code": "AB12C"
   *   },
   *   "error": null
   * }
   */
  generateInvite: async (): Promise<string> => {
    const response = await apiClient.post<GenerateInviteResponse>('/links/generate-invite');

    if (!response.data.data?.invite_code) {
      throw new Error('No invite code received');
    }

    return response.data.data.invite_code;
  },
};
