<script lang="ts">
	import { onMount } from 'svelte';
	import Progress from '@/components/ui/progress/progress.svelte';

	let progressValue = $state(0);

	function animateToFull() {
		progressValue = 0; // Reset progress
		const interval = setInterval(() => {
			progressValue += 1; // Increment progress
			if (progressValue >= 100) {
				clearInterval(interval); // Stop animation at 100%
			}
		}, 5); // Adjust the speed (20ms for smoother animation)
	}

	onMount(() => {
		animateToFull();
	});
</script>

<div class="py-10">
	<Progress value={progressValue} />
</div>
