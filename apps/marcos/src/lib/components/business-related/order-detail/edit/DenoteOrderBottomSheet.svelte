<script lang="ts">
	import { enhance } from '$app/forms';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import BottomSheetLoading from '@/components/generic/BottomSheetLoading.svelte';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';
	let sheetLoading = $state(false);

	const enhanceSheetForm = () => {
		sheetLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			sheetLoading = false;
		};
	};
</script>

<BottomSheet
	title="Convertir en presupuesto"
	description="Esta acción no se puede deshacer. El nuevo presupuesto conservará todos los elementos,
precios y fotos del pedido. Se eliminarán pagos a cuenta y fecha de entrega."
	iconType={IconType.ORDER_QUOTE}
	triggerStyle={ButtonStyle.ORDER_QUOTE}
>
	{#snippet trigger()}
		<Button
			icon={IconType.ORDER_QUOTE}
			text="Convertir en presupuesto"
			action={ButtonAction.TRIGGER}
		></Button>
	{/snippet}

	{#snippet action()}
		<form
			use:enhance={enhanceSheetForm}
			class="w-full"
			method="post"
			action={`?/${OrderActionNames.DENOTE}`}
		>
			{#if sheetLoading}
				<BottomSheetLoading />
			{:else}
				<Button text="Convertir en presupuesto" icon={IconType.EDIT} action={ButtonAction.SUBMIT}
				></Button>
			{/if}
		</form>
	{/snippet}
</BottomSheet>
