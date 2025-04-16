<script lang="ts">
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { OrderActionNames } from '@/shared/mappings/order.mapping';
</script>

<Button
	text="Imprimir"
	action={ButtonAction.SUBMIT}
	formAction={`?/${OrderActionNames.CREATE_EXTERNAL_ORDER}`}
	icon={IconType.PRINTER}
	style={ButtonStyle.ORDER_GENERIC}
	textType={ButtonText.GRAY}
></Button>
