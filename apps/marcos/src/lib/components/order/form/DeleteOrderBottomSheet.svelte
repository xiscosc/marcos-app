<script lang="ts">
	import { enhance } from '$app/forms';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import BottomSheetLoading from '@/components/BottomSheetLoading.svelte';
	import { OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';

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

{#snippet sheetTriggerDelete()}
	<Button
		icon={IconType.TRASH}
		text={order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
		action={ButtonAction.TRIGGER}
	></Button>
{/snippet}

{#snippet sheetActionDelete()}
	<form class="w-full" method="post" action="?/deleteOrder" use:enhance={enhanceSheetForm}>
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

<BottomSheet
	title={order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
	description="Esta acción no se puede deshacer"
	trigger={sheetTriggerDelete}
	action={sheetActionDelete}
	iconType={IconType.TRASH}
	triggerStyle={ButtonStyle.DELETE}
></BottomSheet>
