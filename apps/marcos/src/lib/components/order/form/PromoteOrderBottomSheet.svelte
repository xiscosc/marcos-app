<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import { Input } from '$lib/components/ui/input';
	import {
		promoteOrderSchema,
		type PromoteOrderSchema
	} from '$lib/shared/form-schema/order.form-schema';
	import { dateProxy, superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import BottomSheetLoading from '$lib/components/BottomSheetLoading.svelte';
	interface Props {
		data: SuperValidated<Infer<PromoteOrderSchema>>;
	}

	let { data }: Props = $props();
	const form = superForm(data, {
		validators: zodClient(promoteOrderSchema),
		id: 'promote-order-form'
	});

	const { enhance, submitting } = form;
	const proxyDate = dateProxy(form, 'deliveryDate', { format: 'date' });
</script>

<BottomSheet
	title="Convertir en pedido"
	description="Rellene la fecha de entrega para el pedido. Esta acción no se puede deshacer. El nuevo
pedido conservará todos los elementos, precios y fotos del presupuesto."
	iconType={IconType.ORDER_DEFAULT}
	triggerTextType={ButtonText.GRAY}
	triggerStyle={ButtonStyle.ORDER_GENERIC}
>
	{#snippet trigger()}
		<Button icon={IconType.ORDER_DEFAULT} text="Convertir en pedido" action={ButtonAction.TRIGGER}
		></Button>
	{/snippet}

	{#snippet action()}
		<form method="POST" use:enhance action="?/promote" class="flex flex-col gap-2">
			{#if $submitting}
				<BottomSheetLoading />
			{:else}
				<Form.Field {form} name="deliveryDate">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Fecha de entrega:</Form.Label>
							<Input {...props} bind:value={$proxyDate} type="date" />
						{/snippet}
					</Form.Control>
					<Form.Description>La fecha debe ser posterior o igual a hoy.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Button text="Convertir en pedido" icon={IconType.EDIT} action={ButtonAction.SUBMIT}
				></Button>
			{/if}
		</form>
	{/snippet}
</BottomSheet>
