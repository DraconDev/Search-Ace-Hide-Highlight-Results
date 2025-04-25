import { Store } from "@/types/types";

export const defaultStore: Store = {
    env: "",
    hiddenResults: [],
    highlightedResults: {},
    suspended: false
};

export const store = storage.defineItem<Store>("sync:store", {
    fallback: defaultStore,
});
