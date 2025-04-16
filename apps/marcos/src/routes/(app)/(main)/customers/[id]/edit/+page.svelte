<script lang="ts">
	import NewCustomer from '@/components/business-related/customer/NewCustomer.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum.js';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	let { data } = $props();
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER}>Editar cliente</SimpleHeading>
	<NewCustomer {data} title={''} buttonText={'Editar'} />
</div>
