<script lang="ts">
	import type { PageData } from './$types';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import Box from '$lib/components/Box.svelte';
	import { goto } from '$app/navigation';
	import Banner from '$lib/components/Banner.svelte';
	import { ButtonStyle } from '$lib/components/button/button.enum';
	import { IconType } from '$lib/components/icon/icon.enum';
	import { Input } from '$lib/components/ui/input';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchQuery = $state('');

	function triggerSearch() {
		goto(`/customers/search-list?query=${btoa(searchQuery)}&linkOrderId=${data.order.id}`);
	}
</script>

<div class="flex flex-col gap-2">
	<Banner
		icon={IconType.USER}
		colorName="teal"
		title="Vincular cliente al {data.orderName}"
		text="Rellene sólo el teléfono, si el cliente no existe, tendrá que poner su nombre. También puede buscar por nombre."
	></Banner>

	<div class="flex flex-col gap-2">
		<NewCustomer
			{data}
			link
			icon={IconType.PHONE}
			title={'Vincular por teléfono o crear nuevo cliente'}
			buttonText={'Vincular'}
		/>

		<Box title={'Buscar cliente por nombre'} icon={IconType.SEARCH}>
			<div class="flex flex-col gap-3">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="phone">Nombre:</label>
					<Input bind:value={searchQuery} id="name" required type="text" name="name" />
				</div>

				<Button
					disabled={searchQuery.length === 0}
					icon={IconType.SEARCH}
					text="Buscar"
					style={ButtonStyle.CUSTOMER}
					onClick={() => {
						triggerSearch();
					}}
				></Button>
			</div>
		</Box>

		<OrderInfo order={data.order}></OrderInfo>

		<OrderElements order={data.order} calculatedItem={data.calculatedItem}></OrderElements>
	</div>
</div>
