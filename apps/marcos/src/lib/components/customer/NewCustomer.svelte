<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Box from '$lib/components/Box.svelte';
	import Button from '../button/Button.svelte';
	import { ButtonAction, ButtonStyle } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Input from '../ui/input/input.svelte';
	import {
		customerSchema,
		linkCustomerSchema,
		type CustomerSchema,
		type LinkCustomerSchema
	} from '$lib/shared/customer.utilities';
	interface Props {
		data: {
			form: SuperValidated<Infer<CustomerSchema | LinkCustomerSchema>>;
		};
		title?: string;
		link?: boolean;
		icon?: IconType;
		buttonText?: string;
	}

	let { data, icon, title = 'Crear Cliente', buttonText = 'Crear', link = false }: Props = $props();
	const form = superForm(data.form, {
		validators: zodClient(link ? linkCustomerSchema : customerSchema)
	});
	const { form: formData, enhance, submitting } = form;
</script>

<Box {title} {icon}>
	<div>
		<form method="POST" use:enhance class="flex flex-col gap-2">
			{#if $submitting}
				<ProgressBar text={'Guardando cambios'} />
			{:else}
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Nombre</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="phone">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Teléfono</Form.Label>
							<Input {...props} bind:value={$formData.phone} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Button
					icon={IconType.EDIT}
					text={buttonText}
					style={ButtonStyle.NEUTRAL}
					action={ButtonAction.SUBMIT}
				></Button>
			{/if}
		</form>
	</div>
</Box>
