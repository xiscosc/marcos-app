<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		success = false,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes & { success?: boolean }>> = $props();
	const successClass =
		'data-[success=true]:bg-green-100 data-[success=true]:focus:border-green-200 data-[success=true]:focus:ring-green-200';
</script>

<textarea
	bind:this={ref}
	class={cn(
		`${successClass} flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
		className
	)}
	data-success={success}
	bind:value
	{...restProps}
></textarea>
