<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { ChevronDown } from 'lucide-svelte';

	let {
		children = undefined,
		ref = $bindable(null),
		value = $bindable(),
		success = false,
		class: className,
		...restProps
	}: WithElementRef<HTMLSelectAttributes & { success?: boolean }> = $props();

	const defaultClass =
		'appearance-none data-[success=true]:bg-green-100 data-[success=true]:focus:border-green-200 data-[success=true]:focus:ring-green-200 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1';
</script>

<div class="relative w-full">
	<select
		tabindex="-1"
		data-success={success}
		bind:this={ref}
		class={cn(defaultClass, className)}
		bind:value
		{...restProps}
	>
		{@render children?.()}
	</select>
	<span
		class="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center"
	>
		<ChevronDown class="size-4" />
	</span>
</div>
