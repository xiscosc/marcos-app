<script lang="ts">
	import {
		CircleX,
		ClipboardList,
		Minus,
		Package,
		Plus,
		Search,
		Truck,
		QrCode,
		FilePenLine,
		User,
		CircleCheck,
		Clock,
		MapPin,
		Link,
		Eye,
		RefreshCw,
		Trash2,
		ShoppingCart,
		MailCheck,
		ArrowDown,
		ListTodo,
		Printer,
		CopyX,
		Video,
		Download,
		Ruler,
		CircleHelp,
		FilePlus,
		House,
		Cog,
		LogOut,
		Grid2x2,
		FileSpreadsheet,
		BadgeEuro,
		Copy,
		Camera,
		UserPlus,
		TriangleAlert,
		ChevronLeft,
		ChevronRight,
		Ellipsis,
		Phone,
		ChartNoAxesCombined,
		ChartPie,
		ChartColumnBig,
		BadgePlus,
		SearchX,
		Percent,
		Tag,
		TicketPercent,
		ChevronsUpDown,
		UserPen,
		FileText
	} from 'lucide-svelte';
	import { IconSize, IconType } from '../icon/icon.enum';
	import { siWhatsapp } from 'simple-icons';
	import type { ComponentType } from 'svelte';

	interface Props {
		type: IconType;
		size?: IconSize;
	}

	let { type, size = IconSize.DEFAULT }: Props = $props();

	type IconMapType = {
		[key in IconType]?: ComponentType;
	};

	// Map icon types to their components
	const iconMap: IconMapType = {
		[IconType.CLOSE]: CopyX,
		[IconType.SEARCH]: Search,
		[IconType.PLUS]: Plus,
		[IconType.MINUS]: Minus,
		[IconType.ORDER_DEFAULT]: Package,
		[IconType.ORDER_PENDING]: RefreshCw,
		[IconType.ORDER_FINISHED]: CircleCheck,
		[IconType.DONE]: CircleCheck,
		[IconType.ORDER_PICKED_UP]: Truck,
		[IconType.TRUCK]: Truck,
		[IconType.ORDER_QUOTE]: ClipboardList,
		[IconType.QR]: QrCode,
		[IconType.SENT]: MailCheck,
		[IconType.EDIT]: FilePenLine,
		[IconType.USER]: User,
		[IconType.COINS]: BadgeEuro,
		[IconType.LOCATION]: MapPin,
		[IconType.CLOCK]: Clock,
		[IconType.LINK]: Link,
		[IconType.EYE]: Eye,
		[IconType.TRASH]: Trash2,
		[IconType.CART]: ShoppingCart,
		[IconType.DOWN]: ArrowDown,
		[IconType.LIST]: ListTodo,
		[IconType.PRINTER]: Printer,
		[IconType.NOT_DONE]: CircleX,
		[IconType.VIDEO]: Video,
		[IconType.DOWNLOAD]: Download,
		[IconType.RULER]: Ruler,
		[IconType.QUESTION]: CircleHelp,
		[IconType.FORM]: FilePlus,
		[IconType.HOME]: House,
		[IconType.SETTINGS]: Cog,
		[IconType.LOGOUT]: LogOut,
		[IconType.MOLD]: Grid2x2,
		[IconType.EXCEL]: FileSpreadsheet,
		[IconType.COPY]: Copy,
		[IconType.CAMERA]: Camera,
		[IconType.USER_PLUS]: UserPlus,
		[IconType.ALERT]: TriangleAlert,
		[IconType.LEFT]: ChevronLeft,
		[IconType.RIGHT]: ChevronRight,
		[IconType.LOADING]: Ellipsis,
		[IconType.PHONE]: Phone,
		[IconType.DASHBOARD]: ChartPie,
		[IconType.CHART_LINES]: ChartNoAxesCombined,
		[IconType.CHART_BARS]: ChartColumnBig,
		[IconType.ADD]: BadgePlus,
		[IconType.NOT_FOUND]: SearchX,
		[IconType.DISCOUNT]: Percent,
		[IconType.TICKET]: Tag,
		[IconType.TICKET_DISCOUNT]: TicketPercent,
		[IconType.COLLAPSE]: ChevronsUpDown,
		[IconType.WORKER]: UserPen,
		[IconType.DOCUMENT]: FileText
	};

	// Reactive declarations using Svelte 5 runes
	const isWhatsApp = $derived(type === IconType.WHATSAPP);
	const isLogo = $derived(type === IconType.LOGO);
	const IconComponent = $derived(iconMap[type]);

	// Helper function for logo size classes
	function getLogoSizeClass(iconSize: IconSize): string {
		switch (iconSize) {
			case IconSize.SMALL:
				return 'h-4 w-4';
			case IconSize.DEFAULT:
				return 'h-6 w-6';
			case IconSize.BIG:
				return 'h-7 w-7';
			case IconSize.XL:
				return 'h-8 w-8';
			default:
				return 'h-6 w-6';
		}
	}
</script>

{#if isWhatsApp}
	<svg
		role="img"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		xmlns="http://www.w3.org/2000/svg"
		fill="currentColor"
	>
		<title>{siWhatsapp.title}</title>
		<path d={siWhatsapp.path} />
	</svg>
{:else if isLogo}
	<img src="/mmss_favicon_black.ico" alt="Icon" class={getLogoSizeClass(size)} />
{:else if IconComponent}
	{#key type}
		<IconComponent {size} />
	{/key}
{/if}
