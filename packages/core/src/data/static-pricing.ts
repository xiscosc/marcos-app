import type { ListPrice, MaxArea, MaxAreaM2 } from "../types/pricing.type";
import { InvalidSizeError } from "../error/invalid-size.error";
import { moldMatrix } from "./mold-matrix";

const defaultTax = 1.21;

export function getMoldPrice(mPrice: number, d1: number, d2: number): number {
  const factor =
    moldMatrix[Math.max(10, Math.min(d1, d2))]?.[Math.max(d1, d2, 15)];
  if (factor != null) return Math.ceil(factor * mPrice * 100) / 100;
  throw new Error("Mold factor not found");
}

export function getFabricPrice(d1: number, d2: number): number {
  const x = d1 + d2;
  return Math.ceil((0.0308 * x + 1.95) * 10) / 10;
}

export function getCrossbarPrice(mPrice: number, d1: number): number {
  const x = (d1 / 100) * mPrice + 3;
  return Math.ceil(x * 100) / 100;
}

export function leftoverPricing(
  m2Price: number,
  d1: number,
  d2: number,
): number {
  const d1Min = Math.max(15, d1);
  const d2Min = Math.max(15, d2);
  const x = (d1Min / 100) * (d2Min / 100) * m2Price * defaultTax * 5 + 2;
  return Math.ceil(x * 10) / 10;
}

export function areaPricing(m2Price: number, d1: number, d2: number): number {
  const x = (d1 / 100) * (d2 / 100) * m2Price;
  return Math.ceil(x * 100) / 100;
}

export function linearPricing(mPrice: number, d1: number, d2: number): number {
  const x = (d1 / 100 + d2 / 100) * 2 * mPrice;
  return Math.ceil(x * 100) / 100;
}

export function linearPricingShortSide(
  mPrice: number,
  d1: number,
  d2: number,
): number {
  const shortSide = Math.min(d1, d2);
  const x = (shortSide / 100) * mPrice;
  return Math.ceil(x * 100) / 100;
}

export function fitAreaM2Pricing(
  listPrice: ListPrice,
  d1: number,
  d2: number,
): number {
  const area = Math.ceil((d1 / 100) * (d2 / 100) * 100) / 100;
  if (listPrice.areasM2.length === 0) {
    throw new InvalidSizeError(
      `No se ha encontrado el precio para el tamaño ${d1}x${d2} (${area} m2) - ${listPrice.description}`,
    );
  }

  const sortedAreas = sortByArea(listPrice.areasM2);
  let index = 0;
  while (index < sortedAreas.length) {
    const areaPrice = sortedAreas[index]!;
    if (areaPrice.a >= area) return areaPrice.price;
    index += 1;
  }

  throw new InvalidSizeError(
    `No se ha encontrado el precio para el tamaño ${d1}x${d2} (${area} m2) - ${listPrice.description}`,
  );
}

export function fitAreaPricing(
  listPrice: ListPrice,
  d1: number,
  d2: number,
): number {
  if (listPrice.areas.length === 0) {
    throw new InvalidSizeError(
      `No se ha encontrado el precio para el tamaño ${d1}x${d2} - ${listPrice.description}`,
    );
  }

  const sortedAreas = sortByAreaAndPerimeter(listPrice.areas);
  let index = 0;
  while (index < sortedAreas.length) {
    const area = sortedAreas[index]!;
    if (area.d1 >= d1 && area.d2 >= d2) return area.price;
    index += 1;
  }

  throw new InvalidSizeError(
    `No se ha encontrado el precio para el tamaño ${d1}x${d2} - ${listPrice.description}`,
  );
}

function sortByAreaAndPerimeter(data: MaxArea[]): MaxArea[] {
  // Calculate area and perimeter for each MaxArea object
  const areaAndPerimeter = data.map((item) => ({
    ...item,
    area: item.d1 * item.d2,
    perimeter: 2 * (item.d1 + item.d2),
  }));

  // Sort the array based on area and perimeter
  areaAndPerimeter.sort((a, b) => {
    if (a.area !== b.area) {
      return a.area - b.area; // Sort by area
    }

    return a.perimeter - b.perimeter; // If area is the same, sort by perimeter
  });

  // Return the sorted array
  return areaAndPerimeter;
}

function sortByArea(arr: MaxAreaM2[]): MaxAreaM2[] {
  return arr.sort((x, y) => x.a - y.a);
}
