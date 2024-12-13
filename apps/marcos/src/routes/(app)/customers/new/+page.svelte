<script lang="ts">
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	let { data } = $props();
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER_PLUS}>Crear cliente</SimpleHeading>
	<NewCustomer title={''} {data} />
</div>
