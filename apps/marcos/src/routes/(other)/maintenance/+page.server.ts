import { MAINTENANCE_MODE } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const inMaintenance = MAINTENANCE_MODE === 'yes';
	if (!inMaintenance) {
		redirect(307, '/');
	}
}) satisfies PageServerLoad;
