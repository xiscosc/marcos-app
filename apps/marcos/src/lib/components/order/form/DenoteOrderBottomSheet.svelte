<script lang="ts">
	import { enhance } from '$app/forms';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import BottomSheetLoading from '$lib/components/BottomSheetLoading.svelte';

	let sheetLoading = $state(false);

	const enhanceSheetForm = () => {
		sheetLoading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			sheetLoading = false;
		};
	};
</script>

{#snippet sheetTriggerDenote()}
	<Button icon={IconType.ORDER_QUOTE} text="Convertir en presupuesto" action={ButtonAction.TRIGGER}
	></Button>
{/snippet}

{#snippet sheetActionDenote()}
	<form use:enhance={enhanceSheetForm} class="w-full" method="post" action="?/denote">
		{#if sheetLoading}
			<BottomSheetLoading />
		{:else}
			<Button text="Convertir en presupuesto" icon={IconType.EDIT} action={ButtonAction.SUBMIT}
			></Button>
		{/if}
	</form>
{/snippet}

<BottomSheet
	title="Convertir en presupuesto"
	description="Esta acción no se puede deshacer. El nuevo presupuesto conservará todos los elementos,
precios y fotos del pedido. Se eliminarán pagos a cuenta y fecha de entrega."
	trigger={sheetTriggerDenote}
	action={sheetActionDenote}
	iconType={IconType.ORDER_QUOTE}
	triggerStyle={ButtonStyle.ORDER_QUOTE}
></BottomSheet>
