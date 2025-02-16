<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Toaster, toast } from 'svelte-sonner';
	import { enhance as sEnhance } from '$app/forms';
	import * as Form from '$lib/components/ui/form/index.js';
	import Spacer from '$lib/components/item/Spacer.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import {
		formulasMap,
		listPriceSchemaEdit,
		listPriceSchemaNew,
		pricingTypesMap,
		type LisPriceSchemaEdit,
		type LisPriceSchemaNew
	} from '$lib/shared/pricing.utilites';
	import {
		PricingFormula,
		PricingType,
		type MaxArea,
		type MaxAreaM2
	} from '@marcsimolduressonsardina/core/type';
	import Button from '../button/Button.svelte';
	import { ButtonAction, ButtonStyle, ButtonText, ButtonType } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Banner from '../Banner.svelte';
	import SimpleHeading from '../SimpleHeading.svelte';
	import Input from '../ui/input/input.svelte';
	import * as NativeSelect from '../ui/native-select/index.js';
	import Box from '../Box.svelte';
	import { Switch } from '../ui/switch';
	import Label from '../ui/label/label.svelte';
	import BottomSheet from '../BottomSheet.svelte';
	import { fitFormulas } from '@marcsimolduressonsardina/core/util';
	import BottomSheetLoading from '../BottomSheetLoading.svelte';
	import Step from '../Step.svelte';

	interface Props {
		data: SuperValidated<Infer<LisPriceSchemaEdit | LisPriceSchemaNew>>;
		isNew: boolean;
	}

	let { data, isNew }: Props = $props();
	const form = superForm(data, {
		validators: zodClient(isNew ? listPriceSchemaNew : listPriceSchemaEdit),
		dataType: 'json'
	});

	const { form: formData, enhance, submitting } = form;

	let maxD1Value: number | undefined = $state();
	let maxD2Value: number | undefined = $state();
	let maxM2Value: number | undefined = $state();
	let priceValue: number | undefined = $state();

	let isAreaFit = $state(fitFormulas.includes($formData.formula));
	let areas: MaxArea[] = $state($formData.areas);
	let areasM2: MaxAreaM2[] = $state($formData.areasM2);

	function handleFormulaChange() {
		isAreaFit = fitFormulas.includes($formData.formula);
		areas = [];
		areasM2 = [];
		$formData.areas = [];
		$formData.areasM2 = [];
	}

	function handleAddAreaM2() {
		if (maxM2Value && priceValue && maxM2Value > 0 && priceValue >= 0) {
			const areaM2 = {
				a: maxM2Value,
				price: priceValue
			};

			addAreaM2(areaM2);
			maxM2Value = undefined;
			priceValue = undefined;
		} else {
			toast.error('Algunos campos son incorrectos');
		}
	}

	function handleAddArea() {
		if (
			maxD1Value &&
			maxD2Value &&
			priceValue &&
			maxD1Value > 0 &&
			maxD2Value > 0 &&
			priceValue >= 0
		) {
			const area = {
				d1: Math.max(maxD1Value, maxD2Value),
				d2: Math.min(maxD1Value, maxD2Value),
				price: priceValue
			};

			addArea(area);
			maxD1Value = undefined;
			maxD2Value = undefined;
			priceValue = undefined;
		} else {
			toast.error('Algunos campos son incorrectos');
		}
	}

	function handleAreaDelete(area: MaxArea) {
		areas = areas.filter((a) => a !== area);
		$formData.areas = areas;
	}

	function handleAreaM2Delete(area: MaxAreaM2) {
		areasM2 = areasM2.filter((a) => a !== area);
		$formData.areasM2 = areasM2;
	}

	function sortAreas(a: MaxArea, b: MaxArea) {
		if (a.d1 * a.d2 === b.d1 * b.d2) {
			if (a.d1 === b.d1) {
				return a.d2 - b.d2;
			}

			return a.d1 - b.d1;
		}

		return a.d1 * a.d2 - b.d1 * b.d2;
	}

	function addArea(area: MaxArea) {
		const map = new Map<string, MaxArea>();
		[...areas, area].forEach((a) => map.set(`${a.d1}x${a.d2}`, a));
		areas = [...map.values()].sort(sortAreas);
		$formData.areas = areas;
	}

	function addAreaM2(area: MaxAreaM2) {
		const map = new Map<string, MaxAreaM2>();
		[...areasM2, area].forEach((a) => map.set(`${a.a}`, a));
		areasM2 = [...map.values()].sort((x, y) => x.a - y.a);
		$formData.areasM2 = areasM2;
	}

	let formLoading = $state(false);
</script>

<Toaster richColors />

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.COINS}>
		{#if isNew}
			Crear nuevo precio
		{:else}
			Editar precio
		{/if}
	</SimpleHeading>

	<Box>
		<div class="flex flex-col gap-2">
			<form use:enhance method="post" action="?/createOrEdit">
				{#if $submitting}
					<ProgressBar text="Guardando precio" />
				{:else}
					<div class="flex flex-col gap-2">
						<div class="flex w-full flex-col place-content-center gap-2 lg:grid lg:grid-cols-2">
							<Spacer line={false} title={'Datos básicos'} />

							<Form.Field {form} name="id">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>ID:</Form.Label>
										<Input
											{...props}
											bind:value={$formData.id}
											disabled={isNew ? false : true}
											type="text"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="description">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Descripción:</Form.Label>
										<Input {...props} bind:value={$formData.description} type="text" />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="type">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Tipo:</Form.Label>
										{#if !isNew && $formData.type === PricingType.MOLD}
											<NativeSelect.Root name={props.name} disabled>
												<option>Marco/Moldura</option>
											</NativeSelect.Root>
										{:else}
											<NativeSelect.Root
												name={props.name}
												bind:value={$formData.type}
												disabled={!isNew}
											>
												{#each Object.entries(pricingTypesMap) as [p, label]}
													<option value={p}>{label}</option>
												{/each}
											</NativeSelect.Root>
										{/if}
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="formula">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Cómo calcular:</Form.Label>
										{#if !isNew && $formData.type === PricingType.MOLD}
											<NativeSelect.Root name={props.name} disabled>
												<option>Marco/Moldura</option>
											</NativeSelect.Root>
										{:else}
											<NativeSelect.Root
												name={props.name}
												onchange={handleFormulaChange}
												bind:value={$formData.formula}
												disabled={!isNew}
											>
												{#each Object.entries(formulasMap) as [p, label]}
													<option value={p}>{label}</option>
												{/each}
											</NativeSelect.Root>
										{/if}
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Spacer title={'Datos del precio'} />

							{#if isAreaFit}
								{#if $formData.formula === PricingFormula.FORMULA_FIT_AREA}
									<div class="flex flex-col gap-2">
										<Label for="d1">Dimensión máxima 1:</Label>
										<Input type="number" step="0.01" name="d1" bind:value={maxD1Value} />
									</div>

									<div class="flex flex-col gap-2">
										<Label for="d1">Dimensión máxima 2:</Label>
										<Input type="number" step="0.01" name="d2" bind:value={maxD2Value} />
									</div>

									<div class="flex flex-row items-end gap-2 lg:col-span-2">
										<div class="flex flex-1 flex-col gap-2">
											<Label for="d1">Precio del trozo:</Label>
											<Input type="number" step="0.01" name="piecePrice" bind:value={priceValue} />
										</div>
										<div class="flex-1">
											<Button text="Añadir" icon={IconType.PLUS} onClick={handleAddArea}></Button>
										</div>
									</div>

									{#if areas.length > 0}
										<Spacer title={'Trozos añadidos'} />
										<div class="flex flex-col gap-3 lg:col-span-2">
											{#each areas as area}
												<Step
													icon={IconType.RULER}
													title="Medidas ≤ {area.d1} x {area.d2}"
													subtitle="{area.price.toFixed(2)} €"
													showDelete={true}
													deleteFunction={() => handleAreaDelete(area)}
												/>
											{/each}
										</div>
									{/if}
								{/if}
								{#if $formData.formula === PricingFormula.FORMULA_FIT_AREA_M2}
									<div class="lg:col-span-2">
										<Banner
											icon={IconType.QUESTION}
											title="Área mayor o igual que (≥)"
											colorName="blue"
											text="No existe la posibilidad de introducir un precio del tipo mayor o igual que, todos
								deben ser menor o igual que. Para solucionar este problema, introduzca un valor para
								área máxima lo suficientemente grande para el último trozo (Área ≤ 200 m2)."
										></Banner>
									</div>

									<div class="flex flex-col gap-2">
										<Label for="d1">Área máxima:</Label>
										<Input type="number" step="0.01" name="m2" bind:value={maxM2Value} />
									</div>

									<div class="flex flex-col gap-2">
										<Label for="d1">Precio del trozo:</Label>
										<Input type="number" step="0.01" name="piecePrice" bind:value={priceValue} />
									</div>

									<div class="lg:col-span-2">
										<Button text="Añadir" icon={IconType.PLUS} onClick={handleAddAreaM2} />
									</div>
									{#if areasM2.length > 0}
										<Spacer title={'Trozos añadidos'} />
										<div class="flex flex-col gap-3 lg:col-span-2">
											{#each areasM2 as area}
												<Step
													icon={IconType.RULER}
													title="Área ≤ {area.a} m2"
													subtitle="{area.price.toFixed(2)} €"
													showDelete={true}
													deleteFunction={() => handleAreaM2Delete(area)}
												/>
											{/each}
										</div>
									{/if}
								{/if}
							{:else}
								<Form.Field {form} name="price" class="lg:col-span-2">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Precio:</Form.Label>
											<Input
												type="number"
												step="0.01"
												name="priority"
												bind:value={$formData.price}
											/>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>

								<Form.Field {form} name="price">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Alto máximo:</Form.Label>
											<Input type="number" step="0.01" name="maxD1" bind:value={$formData.maxD1} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>

								<Form.Field {form} name="price">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Ancho Máximo:</Form.Label>
											<Input type="number" step="0.01" name="maxD2" bind:value={$formData.maxD2} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							{/if}

							<Spacer title={'Otros datos'} />

							<Form.Field {form} name="priority">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Prioridad (Cuanto más alto, antes saldrá en la lista):</Form.Label>
										<Input type="number" step="1" name="priority" bind:value={$formData.priority} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="minPrice">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Precio mínimo:</Form.Label>
										<Input
											type="number"
											step="0.01"
											name="minPrice"
											bind:value={$formData.minPrice}
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="discountAllowed">
								<Form.Control>
									{#snippet children({ props })}
										<div
											class="flex h-10 flex-row items-center justify-between rounded-md border px-2"
										>
											<Form.Label>Descuento permitido</Form.Label>
											<Switch bind:checked={$formData.discountAllowed} />
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<div class="lg:col-span-2">
								<Button
									text="Guardar"
									icon={IconType.EDIT}
									style={ButtonStyle.ORDER_GENERIC}
									action={ButtonAction.SUBMIT}
									textType={ButtonText.GRAY}
								></Button>
							</div>
						</div>
					</div>
				{/if}
			</form>

			{#if !isNew && !$submitting}
				<BottomSheet
					title="Eliminar precio"
					description="Esta acción no se puede desacer"
					iconType={IconType.TRASH}
					triggerStyle={ButtonStyle.DELETE}
				>
					{#snippet trigger()}
						<Button icon={IconType.TRASH} text="Eliminar precio" action={ButtonAction.TRIGGER}
						></Button>
					{/snippet}

					{#snippet action()}
						<form
							class="w-full text-center"
							method="post"
							action="?/deletePrice"
							use:sEnhance={() => {
								formLoading = true;
								return async ({ update }) => {
									await update();
								};
							}}
						>
							{#if formLoading}
								<BottomSheetLoading />
							{:else}
								<Button
									icon={IconType.TRASH}
									text="Confirmar"
									style={ButtonStyle.DELETE}
									action={ButtonAction.SUBMIT}
								></Button>
							{/if}
						</form>
					{/snippet}
				</BottomSheet>
			{/if}
		</div>
	</Box>
</div>
