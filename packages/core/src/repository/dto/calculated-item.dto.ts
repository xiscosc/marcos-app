export type CalculatedItemDto = {
  orderUuid: string;
  discount: number;
  parts: CalculatedItemPartDto[];
  quantity: number;
};

export type CalculatedItemPartDto = {
  priceId: string;
  price: number;
  discountAllowed?: boolean;
  quantity: number;
  description: string;
  log?: string;
  floating?: boolean;
};
