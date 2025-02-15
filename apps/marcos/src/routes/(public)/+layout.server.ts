import { ENV_NAME } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	return { envName: ENV_NAME };
}) satisfies LayoutServerLoad;
