<script lang="ts">
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Input from '@/components/ui/input/input.svelte';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';

	let hiddenButton: HTMLButtonElement | undefined = $state(undefined);

	let { reference = $bindable() }: { reference: string } = $props();
</script>

<BottomSheet
	title="Confirmación"
	description="¿Está seguro de que desea imprimir? Una vez impreso, no podrá ser modificado."
	iconType={IconType.ALERT}
	triggerStyle={ButtonStyle.ORDER_GENERIC}
	triggerTextType={ButtonText.GRAY}
>
	{#snippet trigger()}
		<Button text="Imprimir" action={ButtonAction.TRIGGER} icon={IconType.PRINTER}></Button>
	{/snippet}
	{#snippet action()}
		<div class="flex flex-col gap-2">
			<Input bind:value={reference} name="reference" placeholder="Referencia" />
			<Button
				text="Imprimir"
				action={ButtonAction.CLICK}
				style={ButtonStyle.ORDER_GENERIC}
				textType={ButtonText.GRAY}
				icon={IconType.PRINTER}
				onClick={() => {
					hiddenButton?.click();
				}}
			></Button>
		</div>
	{/snippet}
</BottomSheet>

<button
	type="submit"
	class="hidden"
	formAction={`?/${OrderActionNames.CREATE_EXTERNAL_ORDER}`}
	bind:this={hiddenButton}
>
	Imprimir
</button>
