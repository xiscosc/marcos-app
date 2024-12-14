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
		ChartColumnBig
	} from 'lucide-svelte';
	import { IconSize, IconType } from '../icon/icon.enum';
	import { siWhatsapp } from 'simple-icons';
	interface Props {
		type: IconType;
		size?: IconSize;
	}

	let { type, size = IconSize.DEFAULT }: Props = $props();
</script>

{#if type === IconType.SEARCH}
	<Search {size} />
{/if}
{#if type === IconType.CLOSE}
	<CopyX {size} />
{/if}
{#if type === IconType.PLUS}
	<Plus {size} />
{/if}
{#if type === IconType.MINUS}
	<Minus {size} />
{/if}
{#if type === IconType.ORDER_DEFAULT}
	<Package {size} />
{/if}
{#if type === IconType.ORDER_PENDING}
	<RefreshCw {size} />
{/if}
{#if type === IconType.ORDER_FINISHED || type === IconType.DONE}
	<CircleCheck {size} />
{/if}
{#if type === IconType.ORDER_PICKED_UP || type === IconType.TRUCK}
	<Truck {size} />
{/if}
{#if type === IconType.ORDER_QUOTE}
	<ClipboardList {size} />
{/if}
{#if type === IconType.QR}
	<QrCode {size} />
{/if}
{#if type === IconType.SENT}
	<MailCheck {size} />
{/if}
{#if type === IconType.EDIT}
	<FilePenLine {size} />
{/if}
{#if type === IconType.USER}
	<User {size} />
{/if}
{#if type === IconType.COINS}
	<BadgeEuro {size} />
{/if}
{#if type === IconType.LOCATION}
	<MapPin {size} />
{/if}
{#if type === IconType.WHATSAPP}
	<svg
		role="img"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		xmlns="http://www.w3.org/2000/svg"
		fill="white"
	>
		<title>{siWhatsapp.title}</title>
		<path d={siWhatsapp.path} />
	</svg>
{/if}
{#if type === IconType.CLOCK}
	<Clock {size} />
{/if}
{#if type === IconType.LINK}
	<Link {size} />
{/if}
{#if type === IconType.EYE}
	<Eye {size} />
{/if}
{#if type === IconType.TRASH}
	<Trash2 {size} />
{/if}
{#if type === IconType.CART}
	<ShoppingCart {size} />
{/if}
{#if type === IconType.DOWN}
	<ArrowDown {size} />
{/if}
{#if type === IconType.LIST}
	<ListTodo {size} />
{/if}
{#if type === IconType.PRINTER}
	<Printer {size} />
{/if}
{#if type === IconType.NOT_DONE}
	<CircleX {size} />
{/if}
{#if type === IconType.VIDEO}
	<Video {size} />
{/if}
{#if type === IconType.DOWNLOAD}
	<Download {size} />
{/if}
{#if type === IconType.RULER}
	<Ruler {size} />
{/if}
{#if type === IconType.QUESTION}
	<CircleHelp {size} />
{/if}
{#if type === IconType.FORM}
	<FilePlus {size} />
{/if}
{#if type === IconType.HOME}
	<House {size} />
{/if}
{#if type === IconType.SETTINGS}
	<Cog {size} />
{/if}
{#if type === IconType.LOGOUT}
	<LogOut {size} />
{/if}
{#if type === IconType.MOLD}
	<Grid2x2 {size} />
{/if}
{#if type === IconType.EXCEL}
	<FileSpreadsheet {size} />
{/if}
{#if type === IconType.COPY}
	<Copy {size} />
{/if}
{#if type === IconType.CAMERA}
	<Camera {size} />
{/if}
{#if type === IconType.USER_PLUS}
	<UserPlus {size} />
{/if}
{#if type === IconType.ALERT}
	<TriangleAlert {size} />
{/if}
{#if type === IconType.LEFT}
	<ChevronLeft {size} />
{/if}
{#if type === IconType.PHONE}
	<Phone {size} />
{/if}
{#if type === IconType.RIGHT}
	<ChevronRight {size} />
{/if}
{#if type === IconType.LOGO}
	{#if size === IconSize.SMALL}
		<img src="/mmss_favicon_black.ico" alt="Icon" class="h-4 w-4" />
	{:else if size === IconSize.DEFAULT}
		<img src="/mmss_favicon_black.ico" alt="Icon" class="h-6 w-6" />
	{:else if size === IconSize.BIG}
		<img src="/mmss_favicon_black.ico" alt="Icon" class="h-7 w-7" />
	{:else if size === IconSize.XL}
		<img src="/mmss_favicon_black.ico" alt="Icon" class="h-8 w-8" />
	{/if}
{/if}
{#if type === IconType.LOADING}
	<Ellipsis {size} />
{/if}

{#if type === IconType.DASHBOARD}
	<ChartPie {size} />
{/if}

{#if type === IconType.CHART_LINES}
	<ChartNoAxesCombined {size} />
{/if}

{#if type === IconType.CHART_BARS}
	<ChartColumnBig {size} />
{/if}
