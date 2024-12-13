<script lang="ts">
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		success = false,
		class: className,
		children,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps & { success?: boolean }> = $props();

	const defaultClass =
		'data-[success=true]:bg-green-100 data-[success=true]:focus:border-green-200 data-[success=true]:focus:ring-green-200 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1';
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-success={success}
	class={cn(defaultClass, className)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDown class="size-4 opacity-50" />
</SelectPrimitive.Trigger>
