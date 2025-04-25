import { useState, useEffect } from "react";
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

  return (
    <div className="min-w-[320px] p-6 bg-gray-800 text-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Highlighted Result Manager</h1>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-300 uppercase">
          Highlighted Results
        </h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="highlightPattern"
            placeholder="URL pattern to highlight"
            className="flex-1 p-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded"
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
            className="px-3 py-1 text-white bg-blue-700 rounded hover:bg-blue-600 hover:text-white"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {Object.entries(state.highlightedResults).map(([pattern, color]) => (
            <li
              key={pattern}
              className="flex items-center justify-between p-2 mb-2 transition-colors bg-gray-700 rounded-lg shadow-sm hover:bg-gray-600"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono truncate max-w-[180px] text-gray-100">
                  {pattern}
                </span>
                <span
                  className="inline-block w-5 h-5 border-2 border-gray-500 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <button
                onClick={() => removeHighlightedPattern(pattern)}
                className="px-2 py-1 text-red-400 transition-colors rounded-md hover:bg-red-900 hover:text-red-200"
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
