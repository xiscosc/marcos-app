<script lang="ts">
	import * as Form from '@/components/ui/form/index.js';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Box from '@/components/generic/Box.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonAction } from '@/components/generic/button/button.enum.js';
	import { IconType } from '@/components/generic/icon/icon.enum.js';
	import { Input } from '@/components/ui/input';
	import { orderPublicIdSchema } from '@/shared/form-schema/order.form-schema';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';

	let { data } = $props();
	const form = superForm(data.form, {
		validators: zodClient(orderPublicIdSchema),
		id: 'location-order-form'
	});
	const { form: formData, enhance, submitting } = form;
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.ORDER_DEFAULT}>Consultar pedido</SimpleHeading>
	<Box>
		<form use:enhance method="post">
			{#if $submitting}
				<ProgressBar text="Buscando pedido..." />
			{:else}
				<Form.Field {form} name="id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Identificador:</Form.Label>
							<Input {...props} bind:value={$formData.id} type="text" />
						{/snippet}
					</Form.Control>
					<Form.Description>Ejemplo: 20240315/AB/34612345678</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Button text="Buscar" icon={IconType.SEARCH} action={ButtonAction.SUBMIT}></Button>
			{/if}
		</form>
	</Box>
</div>
