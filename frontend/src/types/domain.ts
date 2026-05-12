export type Role = "ADMIN" | "RECEPTIONIST" | "WAITER" | "CHEF" | "GUEST";

export type RoomType = "SINGLE" | "DOUBLE" | "SUITE" | "DELUXE";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type BookingStatus = "RESERVED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

export type MenuCategory = "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";
export type PaymentMode = "DIRECT" | "ROOM_TAB";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";

export type InvoiceType = "ROOM_FOLIO" | "RESTAURANT_DIRECT" | "ROOM_TAB_SETTLEMENT";

export type BigIntId = string;

