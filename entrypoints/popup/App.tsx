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
      hiddenResults: { ...state.hiddenResults, [pattern]: true },
    });
  };

  const removeHiddenPattern = (pattern: string) => {
    const { [pattern]: _, ...rest } = state.hiddenResults;
    store.setValue({
      ...state,
      hiddenResults: rest,
    });
  };

  const addHighlightedPattern = (pattern: string, color: string) => {
    store.setValue({
      ...state,
      highlightedResults: { ...state.highlightedResults, [pattern]: color },
    });
  };

  const removeHighlightedPattern = (pattern: string) => {
    const { [pattern]: _, ...rest } = state.highlightedResults;
    store.setValue({
      ...state,
      highlightedResults: rest,
    });
  };

  const toggleSuspended = () => {
    store.setValue({
      ...state,
      suspended: !state.suspended,
    });
  };

  return (
    <div className="min-w-[320px] p-4 bg-white rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Search Result Manager</h1>
        <button
          onClick={toggleSuspended}
          className={`px-3 py-1 rounded ${
            state.suspended ? "bg-green-500" : "bg-yellow-500"
          } text-white`}
        >
          {state.suspended ? "Resume" : "Suspend"}
        </button>
      </div>

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
              const input = document.getElementById(
                "hiddenPattern"
              ) as HTMLInputElement;
              if (input.value) {
                addHiddenPattern(input.value);
                input.value = "";
              }
            }}
            className="px-3 py-1 text-white bg-red-500 rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {Object.keys(state.hiddenResults).map((pattern) => (
            <li
              key={pattern}
              className="flex items-center justify-between p-2 transition-colors bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              <span className="text-sm font-mono truncate max-w-[200px]">
                {pattern}
              </span>
              <button
                onClick={() => removeHiddenPattern(pattern)}
                className="px-2 py-1 text-red-500 transition-colors rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-600 uppercase">Highlighted Results</h2>
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
            defaultValue="#00ff00"
            className="w-10 h-10"
          />
          <button
            onClick={() => {
              const patternInput = document.getElementById(
                "highlightPattern"
              ) as HTMLInputElement;
              const colorInput = document.getElementById(
                "highlightColor"
              ) as HTMLInputElement;
              if (patternInput.value) {
                addHighlightedPattern(patternInput.value, colorInput.value);
                patternInput.value = "";
              }
            }}
            className="px-3 py-1 text-white bg-blue-500 rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {Object.entries(state.highlightedResults).map(([pattern, color]) => (
            <li 
              key={pattern} 
              className="flex items-center justify-between p-2 transition-colors bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono truncate max-w-[180px]">{pattern}</span>
                <span 
                  className="inline-block w-5 h-5 border-2 border-gray-200 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <button 
                onClick={() => removeHighlightedPattern(pattern)}
                className="px-2 py-1 text-red-500 transition-colors rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
