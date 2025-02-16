import type { IconType } from '@/components/icon/icon.enum';
import type { Snippet } from 'svelte';
import { writable } from 'svelte/store';

export const bottomSheetActionStore = writable<Snippet | undefined>(undefined);
export const bottomSheetIconStore = writable<IconType | undefined>(undefined);
export const bottomSheetTitleStore = writable<string | undefined>(undefined);
export const bottomSheetDescriptionStore = writable<string | undefined>(undefined);
export const bottomSheetOpenStore = writable<boolean>(false);

export function setBottomSheet(
	title?: string,
	description?: string,
	icon?: IconType,
	action?: Snippet
) {
	bottomSheetTitleStore.set(title);
	bottomSheetDescriptionStore.set(description);
	bottomSheetIconStore.set(icon);
	bottomSheetActionStore.set(action);
}

export function openBottomSheet() {
	bottomSheetOpenStore.set(true);
}

export function closeBottomSheet() {
	bottomSheetOpenStore.set(false);
}
