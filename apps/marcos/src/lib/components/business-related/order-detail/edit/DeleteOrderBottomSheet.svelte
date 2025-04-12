<script lang="ts">
	import { enhance } from '$app/forms';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import BottomSheetLoading from '@/components/generic/BottomSheetLoading.svelte';
	import { OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';
	let sheetLoading = $state(false);

	interface Props {
		order: Order;
	}

	let { order }: Props = $props();

	const enhanceSheetForm = () => {
		sheetLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			sheetLoading = false;
		};
	};
</script>

<BottomSheet
	title={order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
	description="Esta acción no se puede deshacer"
	iconType={IconType.TRASH}
	triggerStyle={ButtonStyle.DELETE}
>
	{#snippet trigger()}
		<Button
			icon={IconType.TRASH}
			text={order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
			action={ButtonAction.TRIGGER}
		></Button>
	{/snippet}

	{#snippet action()}
		<form
			class="w-full"
			method="post"
			action={`?/${OrderActionNames.DELETE}`}
			use:enhance={enhanceSheetForm}
		>
			{#if sheetLoading}
				<BottomSheetLoading />
			{:else}
				<Button
					icon={IconType.TRASH}
					text="Confirmar"
					style={ButtonStyle.DELETE}
					action={ButtonAction.SUBMIT}
				></Button>
			{/if}
		</form>
	{/snippet}
</BottomSheet>
