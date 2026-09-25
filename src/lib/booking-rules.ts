import type { Booking } from "@/types";

/** Whether a booking is still early enough in its lifecycle for the customer to cancel it. */
export function isCancellableByCustomer(booking: Pick<Booking, "status">): boolean {
  return booking.status === "pending" || booking.status === "accepted";
}
