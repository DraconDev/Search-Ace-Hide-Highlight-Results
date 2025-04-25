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
      <p>Manage hidden and highlighted results on their respective pages.</p>
    </div>
  );
}

export default App;
