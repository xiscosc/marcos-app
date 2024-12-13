<script lang="ts">
	interface Props {
		hideOnDesktop?: boolean;
	}

	let { hideOnDesktop = true }: Props = $props();
</script>

<hr class="mb-3 mt-2 border-t border-gray-200" class:md:!hidden={hideOnDesktop} />
