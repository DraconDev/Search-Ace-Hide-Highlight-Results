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
    <div className="min-w-[320px] p-6 bg-gray-800 text-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Search Result Manager</h1>
        <button
          onClick={toggleSuspended}
          className={`px-3 py-1 rounded ${
            state.suspended ? "bg-green-500" : "bg-yellow-500"
          } text-white`}
        >
          {state.suspended ? "Resume" : "Suspend"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => chrome.runtime.sendMessage({ action: "openHiddenPage" })}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Manage Hidden Results
        </button>
        <button
          onClick={() => chrome.runtime.sendMessage({ action: "openHighlightPage" })}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Manage Highlighted Results
        </button>
      </div>
    </div>
  );
}

export default App;
