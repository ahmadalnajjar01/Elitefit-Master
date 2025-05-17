import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage

import trendingReducer from "./Slices/trendingSlice";
import cartReducer from "./Slices/cartSlice";
import favoriteReducer from "./Slices/favoriteSlice";
import menReducer from "./Slices/menSlice";
import kidsReducer from "./Slices/kidsSlice";
import womenReducer from "./Slices/womenSlice";
import allProductsReducer from "./Slices/allProductsSlice";
import searchReducer from "./Slices/searchSlice";

// Combine reducers
const rootReducer = combineReducers({
  allProducts: allProductsReducer,
  search: searchReducer,
  women: womenReducer,
  kids: kidsReducer,
  men: menReducer,
  trending: trendingReducer,
  cart: cartReducer,
  favorite: favoriteReducer,
});

// Persistence config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "favorite"], // ✅ Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
