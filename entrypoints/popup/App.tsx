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
            <li key={pattern} className="flex items-center justify-between">
              <span>{pattern}</span>
              <button 
                onClick={() => removeHiddenPattern(pattern)}
                className="text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Highlighted Results</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="highlightPattern"
            placeholder="URL pattern to highlight"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="color"
            id="highlightColor"
            defaultValue="#ffff00"
            className="w-10 h-10"
          />
          <button 
            onClick={() => {
              const patternInput = document.getElementById('highlightPattern') as HTMLInputElement;
              const colorInput = document.getElementById('highlightColor') as HTMLInputElement;
              if (patternInput.value) {
                addHighlightedPattern(patternInput.value, colorInput.value);
                patternInput.value = '';
              }
            }}
            className="px-3 py-1 text-white bg-blue-500 rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {Object.entries(state.highlightedResults).map(([pattern, color]) => (
            <li key={pattern} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{pattern}</span>
                <span 
                  className="inline-block w-4 h-4 border border-gray-300 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <button 
                onClick={() => removeHighlightedPattern(pattern)}
                className="text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
