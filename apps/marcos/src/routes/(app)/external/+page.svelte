<script lang="ts">
	import Button from '@/components/generic/button/Button.svelte';
	import type { PageData } from './$types';
	import { ButtonStyle, ButtonText, ButtonType } from '@/components/generic/button/button.enum';
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';

	let { data }: { data: PageData } = $props();
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-4 py-2 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<Button
		text="Crear nota"
		link="/external/orders/new"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.FORM}
		icon={IconType.FORM}
		iconSize={IconSize.BIG}
	></Button>
</div>

<div class="flex flex-row items-center justify-center pt-3">
	<span class="text-xs text-gray-500">
		{`Tienda externa: ${data.storeName}`}
	</span>
</div>
