<script lang="ts">
	import PriceEdit from '@/components/business-related/price/PriceEdit.svelte';
	import type { PageData } from './$types';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<PriceEdit data={data.form} isNew={true} />
