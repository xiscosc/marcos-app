<script lang="ts">
	import { ButtonAction } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';

	interface Props {
		orderStatus?: OrderStatus;
	}

	let { orderStatus = undefined }: Props = $props();
</script>

<Button
	text={orderStatus === OrderStatus.QUOTE ? 'Editar presupuesto' : 'Editar pedido'}
	action={ButtonAction.SUBMIT}
	formAction={`?/${OrderActionNames.EDIT_ORDER}`}
	icon={IconType.EDIT}
></Button>
