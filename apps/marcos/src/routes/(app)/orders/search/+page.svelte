<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ButtonAction } from '$lib/components/button/button.enum.js';
	import { IconType } from '$lib/components/icon/icon.enum.js';
	import { Input } from '$lib/components/ui/input';
	import { orderPublicIdSchema } from '$lib/shared/order.utilities.js';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

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
		{#if $submitting}
			<ProgressBar />
		{:else}
			<form use:enhance class="space-y-4" method="post">
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
			</form>
		{/if}
	</Box>
</div>
