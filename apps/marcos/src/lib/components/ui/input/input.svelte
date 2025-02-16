<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		files = $bindable(),
		success = false,
		error = false,
		class: className,
		type,
		...restProps
	}: WithElementRef<
		HTMLInputAttributes & { files?: FileList; success?: boolean; error?: boolean }
	> = $props();
	const successClass =
		'data-[success=true]:bg-green-100 data-[success=true]:focus:border-green-200 data-[success=true]:focus:ring-green-200';
	const errorClass =
		'data-[error=true]:bg-red-100 data-[error=true]:focus:border-red-200 data-[error=true]:focus:ring-red-200';
	const defaultClass = `bg-white appearance-none ${successClass} ${errorClass} border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50`;
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		type="file"
		class={cn(defaultClass, className)}
		bind:value
		bind:files
		{...restProps}
	/>
{:else}
	<input
		data-success={success && !error}
		data-error={error}
		bind:this={ref}
		{type}
		class={cn(defaultClass, className)}
		bind:value
		{...restProps}
	/>
{/if}
