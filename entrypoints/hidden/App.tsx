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

  return (
    <div className="min-w-[320px] p-6 bg-gray-800 text-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Hidden Result Manager</h1>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-300">Hidden Results</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            id="hiddenPattern"
            placeholder="URL pattern to hide"
            className="flex-1 p-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded"
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
              className="flex items-center justify-between p-2 mb-2 transition-colors bg-gray-700 rounded-lg shadow-sm hover:bg-gray-600"
            >
              <span className="text-sm font-mono truncate max-w-[200px] text-gray-100">
                {pattern}
              </span>
              <button
                onClick={() => removeHiddenPattern(pattern)}
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
