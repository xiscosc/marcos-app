import { readable } from 'svelte/store';
import { browser } from '$app/environment';

const innerWidth = browser ? window.innerWidth : 0;

export const isSmBreakpoint = readable(innerWidth <= 640, (set) => {
	if (browser) {
		const handleResize = () => {
			set(window.innerWidth <= 640);
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}
});

export const isMdBreakpoint = readable(innerWidth <= 768, (set) => {
	if (browser) {
		const handleResize = () => {
			set(window.innerWidth <= 768);
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}
});

export const isLgBreakpoint = readable(innerWidth <= 1024, (set) => {
	if (browser) {
		const handleResize = () => {
			set(window.innerWidth <= 1024);
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}
});
