<script lang="ts">
	import type { PageData } from './$types';
	import { OrderUtilities } from '@/shared/order.utilities';
	import Qr from '@/components/generic/Qr.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { DateTime } from 'luxon';
	import { orderStatusMap } from '@/shared/mappings/order.mapping';
	import { getStatusUIInfo } from '@/ui/ui.helper';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonAction } from '@/components/generic/button/button.enum';
	import OrderInfoStep from '@/components/business-related/order-detail/OrderInfoStep.svelte';
	import { generateQrString } from '@/shared/qr.utilities';
	import { QrOrigin } from '@/type/qr.type';
	import Icon from '@/components/generic/icon/Icon.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<meta property="og:title" content="Resguardo del pedido" />
	<meta property="og:description" content={`Pedido ${data.fullOrder.order.publicId}`} />
	<meta
		property="og:image"
		content="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
	/>
	<meta property="og:url" content={OrderUtilities.getOrderPublicUrl(data.fullOrder.order)} />
	<meta property="og:type" content="website" />
</svelte:head>

<div
	class="flex w-full flex-col items-center gap-2 p-4 font-sans md:min-h-screen md:justify-center md:p-0 md:pt-4"
>
	<div class="flex w-full flex-col items-center gap-2">
		<div
			class="flex w-full flex-col items-center justify-center gap-4 rounded-xl border bg-white pb-4 pt-2 md:w-2/3 lg:w-1/3"
		>
			<div class="flex w-full flex-col items-center">
				<img
					class="w-1/2"
					src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
					alt="logo"
				/>
				<span class="px-2 text-center text-[0.625rem]">
					Horario de lunes a viernes de 09:00 a 18:00, sábados de 09:30 a 13:15
				</span>
			</div>

			<div class="flex rounded-xl border p-3">
				<Qr
					size={125}
					qrData={generateQrString({
						orderId: data.fullOrder.order.id,
						origin: QrOrigin.CUSTOMER_V2
					})}
				></Qr>
			</div>
			<span class="font-mono text-xs">
				{data.fullOrder.order.publicId}
			</span>
			<span
				class={`rounded-2xl border px-3 py-1 text-xs font-semibold uppercase text-white ${getStatusUIInfo(data.fullOrder.order.status).staticColor}`}
			>
				{orderStatusMap[data.fullOrder.order.status]}
			</span>
			<div class="flex flex-col gap-3 px-5">
				<div class="flex flex-col gap-2">
					<OrderInfoStep
						iconType={IconType.CLOCK}
						title="Fecha de entrada"
						value={data.fullOrder.order.item.instantDelivery
							? 'Al momento'
							: DateTime.fromJSDate(data.fullOrder.order.createdAt).toFormat('dd/MM/yyyy')}
					/>
					<OrderInfoStep
						iconType={IconType.TRUCK}
						title="Fecha de recogida"
						value={data.fullOrder.order.item.instantDelivery
							? 'Al momento'
							: DateTime.fromJSDate(data.fullOrder.order.item.deliveryDate).toFormat('dd/MM/yyyy')}
					/>
					<OrderInfoStep
						iconType={IconType.EYE}
						title="Descripción"
						value={data.fullOrder.order.item.description}
					/>
					<OrderInfoStep
						iconType={IconType.LIST}
						title="Observaciones"
						value={data.fullOrder.order.item.observations}
						valueList={data.fullOrder.order.item.predefinedObservations}
					/>
				</div>

				<Button
					icon={IconType.PHONE}
					text="Llamar"
					action={ButtonAction.LINK}
					link="tel:+34971666920"
				></Button>

				<span class="text-center text-[0.625rem]">
					Una vez pasados <span class="font-semibold">
						15 días desde la fecha estipulada de entrega
					</span>, la empresa
					<span class="font-semibold"> no se hará cargo del material. </span>
				</span>
			</div>
		</div>
		<a href={`/s/${data.fullOrder.order.shortId}`} target="_blank" class="text-xs">
			<span class="flex items-center gap-1 hover:underline">
				<Icon type={IconType.PRINTER}></Icon> Versión para imprimir
			</span>
		</a>
	</div>

	<span class="text-center text-[0.625rem] text-gray-500">
		Desarrollado por <a class="font-semibold" href="https://balerial-apps.com" target="_blank">
			balerial-apps.com
		</a>. {DateTime.now().toFormat('yyyy')}.
	</span>
</div>
