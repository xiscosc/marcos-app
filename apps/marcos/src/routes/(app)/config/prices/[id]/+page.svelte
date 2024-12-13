<script lang="ts">
	import PriceEdit from '$lib/components/price/PriceEdit.svelte';
	import type { PageData } from './$types';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<PriceEdit data={data.form} isNew={false} />
