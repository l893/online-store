export interface CreateOrderResponse {
  readonly orderId: string;
  readonly total: number;
}

export interface ConfirmCheckoutRequest {
  readonly orderId: string;
}

export interface ConfirmCheckoutResponse {
  readonly ok: true;
  readonly status: 'paid';
}
