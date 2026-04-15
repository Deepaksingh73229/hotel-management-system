import type { PaginationMeta, SearchParams } from "./api.types";
import type { Guest } from "./guest.types";
import type { AuthUser } from "./auth.types";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type FolioStatus   = "open" | "settled" | "void";
export type FolioType     = "primary" | "split" | "corporate";

export type ChargeType =
    | "room_charge" | "room_service" | "restaurant" | "bar"
    | "laundry" | "spa" | "minibar" | "parking" | "telephone"
    | "extra_bed" | "early_checkin" | "late_checkout" | "extra_guest"
    | "damage" | "cancellation_fee" | "miscellaneous";

export type PaymentMode =
    | "cash" | "credit_card" | "debit_card" | "upi"
    | "bank_transfer" | "corporate_credit" | "loyalty_points" | "other";

export type PaymentType =
    | "deposit" | "partial" | "full_settlement" | "refund" | "adjustment";

// ─────────────────────────────────────────────────────────────────────────────
// TAX LINE (shared with reservation)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaxLine {
    taxName: string;
    rate:    number;
    amount:  number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLIO
// ─────────────────────────────────────────────────────────────────────────────

export interface Folio {
    _id:            string;
    property:       string;
    reservation:    string;
    guest:          Guest;
    folioNumber:    string;
    type:           FolioType;
    parentFolio?:   string | null;
    status:         FolioStatus;
    totalCharges:   number;
    totalPayments:  number;
    totalTax:       number;
    balance:        number;
    settledAt?:     string;
    settledBy?:     AuthUser;
    notes?:         string;
    createdBy:      AuthUser;
    createdAt:      string;
    updatedAt:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLIO CHARGE
// ─────────────────────────────────────────────────────────────────────────────

export interface FolioCharge {
    _id:                 string;
    folio:               string;
    reservation:         string;
    chargeType:          ChargeType;
    description:         string;
    quantity:            number;
    unitPrice:           number;
    amount:              number;
    taxes?:              TaxLine[];
    taxTotal:            number;
    totalWithTax:        number;
    chargeDate:          string;
    isNightAuditPosted:  boolean;
    isVoided:            boolean;
    voidedAt?:           string;
    voidedBy?:           AuthUser;
    voidReason?:         string;
    postedBy:            AuthUser;
    createdAt:           string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface Payment {
    _id:             string;
    folio:           string;
    reservation:     string;
    guest:           Guest;
    paymentNumber:   string;
    amount:          number;
    paymentMode:     PaymentMode;
    transactionRef?: string;
    cardLastFour?:   string;
    bankName?:       string;
    upiId?:          string;
    paymentDate:     string;
    paymentType:     PaymentType;
    isRefund:        boolean;
    refundOf?:       string;
    isVoided:        boolean;
    voidedAt?:       string;
    voidedBy?:       AuthUser;
    voidReason?:     string;
    notes?:          string;
    receivedBy:      AuthUser;
    createdAt:       string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE
// ─────────────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
    description: string;
    quantity:    number;
    unitPrice:   number;
    amount:      number;
    taxes?:      TaxLine[];
    taxTotal:    number;
    total:       number;
}

export interface Invoice {
    _id:            string;
    property:       string;
    folio:          string;
    reservation:    string;
    guest:          Guest;
    invoiceNumber:  string;
    billingName:    string;
    billingAddress?: string;
    gstNumber?:     string;
    lineItems:      InvoiceLineItem[];
    subtotal:       number;
    taxBreakdown:   { taxName: string; amount: number }[];
    totalTax:       number;
    grandTotal:     number;
    amountPaid:     number;
    balanceDue:     number;
    invoiceDate:    string;
    status:         "draft" | "issued" | "void";
    generatedBy:    AuthUser;
    createdAt:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface PostChargePayload {
    chargeType:   ChargeType;
    description:  string;
    quantity?:    number;
    unitPrice:    number;
}

export interface AddPaymentPayload {
    amount:          number;
    paymentMode:     PaymentMode;
    paymentType:     PaymentType;
    transactionRef?: string;
    cardLastFour?:   string;
    upiId?:          string;
    notes?:          string;
}

export interface VoidChargePayload {
    reason: string;
}

export interface GenerateInvoicePayload {
    billingName:     string;
    billingAddress?: string;
    gstNumber?:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS & RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FolioListParams extends SearchParams {
    status?: FolioStatus;
}

export interface FolioListData {
    folios:     Folio[];
    pagination: PaginationMeta;
}

export interface FolioDetailData {
    folio:    Folio;
    charges:  FolioCharge[];
    payments: Payment[];
}

// ─── Charge type display labels ───────────────────────────────────────────────
export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
    room_charge:      "Room charge",
    room_service:     "Room service",
    restaurant:       "Restaurant",
    bar:              "Bar",
    laundry:          "Laundry",
    spa:              "Spa",
    minibar:          "Minibar",
    parking:          "Parking",
    telephone:        "Telephone",
    extra_bed:        "Extra bed",
    early_checkin:    "Early check-in",
    late_checkout:    "Late check-out",
    extra_guest:      "Extra guest",
    damage:           "Damage",
    cancellation_fee: "Cancellation fee",
    miscellaneous:    "Miscellaneous",
};

// ─── Payment mode display labels ──────────────────────────────────────────────
export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
    cash:             "Cash",
    credit_card:      "Credit card",
    debit_card:       "Debit card",
    upi:              "UPI",
    bank_transfer:    "Bank transfer",
    corporate_credit: "Corporate credit",
    loyalty_points:   "Loyalty points",
    other:            "Other",
};