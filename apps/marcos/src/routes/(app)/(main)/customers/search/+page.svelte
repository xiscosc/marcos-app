<script lang="ts">
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import { superForm } from 'sveltekit-superforms';
	import Box from '@/components/generic/Box.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { goto } from '$app/navigation';
	import {
		ButtonAction,
		ButtonStyle,
		ButtonText
	} from '@/components/generic/button/button.enum.js';
	import { IconType } from '@/components/generic/icon/icon.enum.js';
	import Input from '@/components/ui/input/input.svelte';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	let { data } = $props();
	const { form, enhance, submitting } = superForm(data.form);

	let searchQuery = $state('');

	function triggerSearch() {
		goto(`/customers/search-list?query=${btoa(searchQuery)}`);
	}
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER}>Clientes</SimpleHeading>
	<div class="flex flex-col gap-2">
		<Box title={'Buscar cliente por teléfono'}>
			{#if $submitting}
				<ProgressBar />
			{:else}
				<form use:enhance class="flex flex-col gap-2" method="post">
					<div>
						<label class="block text-sm font-medium text-gray-700" for="phone">Teléfono:</label>
						<Input bind:value={$form.phone} id="phone" type="tel" name="phone" />
					</div>

					<Button
						icon={IconType.SEARCH}
						text="Buscar"
						action={ButtonAction.SUBMIT}
						style={ButtonStyle.CUSTOMER}
					></Button>
				</form>
			{/if}
		</Box>

		<Box title={'Buscar cliente por nombre'}>
			<div class="flex flex-col gap-2">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="phone">Nombre:</label>
					<Input bind:value={searchQuery} id="name" required type="text" name="name" />
				</div>

				<Button
					icon={IconType.SEARCH}
					disabled={searchQuery.length < 3}
					onClick={triggerSearch}
					text="Buscar"
					style={ButtonStyle.CUSTOMER}
				></Button>
			</div>
		</Box>

		<Box title={'Gestión'}>
			<div class="flex flex-col gap-2 md:flex-row">
				{#if data.canSeeList}
					<Button
						icon={IconType.USER}
						textType={ButtonText.GRAY}
						link="/customers/list"
						text="Ver listado"
						style={ButtonStyle.ORDER_GENERIC}
					></Button>
				{/if}

				<Button
					link="/customers/new"
					icon={IconType.USER_PLUS}
					text="Crear cliente"
					style={ButtonStyle.NEUTRAL}
				></Button>
			</div>
		</Box>
	</div>
</div>
