<script lang="ts">
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';
</script>

<div class="flex flex-col gap-2 lg:col-span-2 lg:flex-row">
	<Button
		text="Crear pedido"
		action={ButtonAction.SUBMIT}
		style={ButtonStyle.ORDER_GENERIC}
		textType={ButtonText.GRAY}
		formAction={`?/${OrderActionNames.CREATE_ORDER}`}
		icon={IconType.ORDER_FINISHED}
	></Button>
	<Button
		text="Crear presupuesto"
		action={ButtonAction.SUBMIT}
		style={ButtonStyle.ORDER_QUOTE}
		formAction={`?/${OrderActionNames.CREATE_QUOTE}`}
		icon={IconType.ORDER_QUOTE}
	></Button>
</div>
