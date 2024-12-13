import { DateTime } from "luxon";
import { Order } from "../types/order.type";

export const tempCustomerUuid = "temp-customer";
export const quoteDeliveryDate = DateTime.fromFormat(
  "31/12/9999",
  "dd/MM/yyyy",
).toJSDate();

export class OrderUtilities {
  static isOrderTemp(order: Order): boolean {
    return order.customer.id === tempCustomerUuid;
  }
}
