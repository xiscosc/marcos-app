import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from './auth';

export const handle = sequence(authHandle);
