export type Store = {
    env: string;
    hiddenResults: string[];
    highlightedResults: Array<{
        pattern: string;
        color: string;
    }>;
};
