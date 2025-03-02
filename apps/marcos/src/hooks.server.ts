import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from './auth';
import { posthogContextHandle } from '@/server/shared/analytics/posthog';
import { getUserHandle } from '@/server/shared/auth/user';

export const handle = sequence(authHandle, getUserHandle, posthogContextHandle);
