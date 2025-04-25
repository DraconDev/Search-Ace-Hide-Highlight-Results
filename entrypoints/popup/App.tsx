import { useState, useEffect } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import { Store } from "@/types/types";
import { store } from "@/utils/store";

function App() {
  const [state, setState] = useState<Store | null>(null);

  useEffect(() => {
    if (!state) {
      (async () => {
        const currentState = await store.getValue();
        setState(currentState);
      })();
    }
    store.watch((newValue) => {
      if (newValue) {
        setState(newValue);
      }
    });
  }, []);

  if (!state) return <div>Loading...</div>;

  const addHiddenPattern = (pattern: string) => {
    store.setValue({
      ...state,
      hiddenResults: [...state.hiddenResults, pattern]
    });
  };

  const removeHiddenPattern = (pattern: string) => {
    store.setValue({
      ...state,
      hiddenResults: state.hiddenResults.filter(p => p !== pattern)
    });
  };

  const addHighlightedPattern = (pattern: string, color: string) => {
    store.setValue({
      ...state,
      highlightedResults: { ...state.highlightedResults, [pattern]: color }
    });
  };

  const removeHighlightedPattern = (pattern: string) => {
    const { [pattern]: _, ...rest } = state.highlightedResults;
    store.setValue({
      ...state,
      highlightedResults: rest
    });
  };

  return (
    <div className="min-w-[300px] p-4 bg-gray-100">
      <h1 className="mb-4 text-lg font-bold">Search Result Manager</h1>
      
      <div className="mb-6">
        <h2 className="mb-2 font-semibold">Hidden Results</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="hiddenPattern"
            placeholder="URL pattern to hide"
            className="flex-1 p-2 border rounded"
          />
          <button 
            onClick={() => {
              const input = document.getElementById('hiddenPattern') as HTMLInputElement;
              if (input.value) {
                addHiddenPattern(input.value);
                input.value = '';
              }
            }}
            className="px-3 py-1 text-white bg-red-500 rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {state.hiddenResults.map(pattern => (
