import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from './auth';
import { posthogContextHandle } from '@/server/shared/analytics/posthog';
import { getUserHandle } from '@/server/shared/auth/user';
import { apiAuthHandler } from '@/server/shared/auth/api';

export const handle = sequence(authHandle, getUserHandle, apiAuthHandler, posthogContextHandle);
