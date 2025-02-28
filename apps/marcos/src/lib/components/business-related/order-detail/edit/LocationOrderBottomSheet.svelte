<script lang="ts">
	import * as Form from '@/components/ui/form/index.js';
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import {
		locationOrderSchema,
		type LocationOrderSchema
	} from '@/shared/form-schema/order.form-schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { Order } from '@marcsimolduressonsardina/core/type';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import BottomSheetLoading from '@/components/generic/BottomSheetLoading.svelte';
	import * as NativeSelect from '@/components/ui/native-select/index.js';

	interface Props {
		data: SuperValidated<Infer<LocationOrderSchema>>;
		locations: string[];
		order: Order;
	}

	let { data, locations, order }: Props = $props();
	const form = superForm(data, {
		validators: zodClient(locationOrderSchema),
		id: 'location-order-form'
	});

	const { form: formData, enhance, submitting } = form;
</script>

<BottomSheet
	title="Cambiar ubicación"
	description="Seleccione donde se ha dejado el pedido después de finalizarse"
	iconType={IconType.LOCATION}
	triggerStyle={ButtonStyle.NEUTRAL_VARIANT}
	triggerTextType={ButtonText.NO_COLOR}
>
	{#snippet trigger()}
		<Button
			text="Ubicación: {order.location.length === 0 ? 'Sin ubicación' : order.location}"
			icon={IconType.LOCATION}
			action={ButtonAction.TRIGGER}
		></Button>
	{/snippet}
	{#snippet action()}
		<form method="post" use:enhance action="?/saveLocation" class="flex flex-col gap-2">
			{#if $submitting}
				<BottomSheetLoading />
			{:else}
				<Form.Field {form} name="location">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Nueva ubicación:</Form.Label>
							<NativeSelect.Root name={props.name} bind:value={$formData.location}>
								<option></option>
								{#each locations as l}
									<option value={l}>{l}</option>
								{/each}
							</NativeSelect.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Button text="Guardar ubicación" icon={IconType.EDIT} action={ButtonAction.SUBMIT}></Button>
			{/if}
		</form>
	{/snippet}
</BottomSheet>
