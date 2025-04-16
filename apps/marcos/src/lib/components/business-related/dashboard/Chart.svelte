<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	interface Props {
		data: { name: string; total: number }[];
		unit: string;
		type: 'bar' | 'line';
	}

	let { data, unit, type }: Props = $props();

	let chartCanvas: HTMLCanvasElement | undefined = $state();

	const barProps = {
		backgroundColor: 'black',
		borderColor: 'black',
		borderWidth: 1,
		borderRadius: 4
	};

	const lineProps = {
		backgroundColor: 'black',
		borderColor: 'black',
		borderWidth: 2,
		tension: 0.4
	};

	onMount(() => {
		if (chartCanvas == null) {
			return;
		}

		const chart = new Chart(chartCanvas, {
			type: type,
			data: {
				labels: data.map((row) => row.name),
				datasets: [
					{
						label: `${unit}`,
						data: data.map((row) => row.total),
						...(type === 'bar' ? barProps : lineProps)
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		return () => {
			chart.destroy();
		};
	});
</script>

<div>
	<canvas bind:this={chartCanvas}></canvas>
</div>
