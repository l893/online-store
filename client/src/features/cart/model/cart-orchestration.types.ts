import type {
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';

import type { cartApi } from '../api/cart.api';
import type { CartState } from './cart.types';

export type CartOrchestrationState = {
  readonly cart: CartState;
  readonly [cartApi.reducerPath]: ReturnType<typeof cartApi.reducer>;
};

export type CartOrchestrationDispatch = ThunkDispatch<
  CartOrchestrationState,
  unknown,
  UnknownAction
>;

export type CartOrchestrationThunk<ReturnValue> = ThunkAction<
  ReturnValue,
  CartOrchestrationState,
  unknown,
  UnknownAction
>;
