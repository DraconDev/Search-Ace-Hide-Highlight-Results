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

  const openHiddenPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    browser.tabs.create({ url: browser.runtime.getURL("/hidden.html") });
  };

  const openHighlightPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    browser.tabs.create({ url: browser.runtime.getURL("/highlight.html") });
  };

  return (
    <div className="min-w-[320px] p-6 bg-gray-900 text-gray-100 rounded-lg shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Search Results Manager</h1>
        <button
          onClick={toggleSuspended}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
            state.suspended ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"
          } text-white`}
        >
          {state.suspended ? "Resume" : "Suspend"}
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <a
          href="#"
          onClick={openHiddenPage}
          className="text-base text-blue-400 hover:text-blue-300 hover:underline"
        >
          Manage Hidden Results
        </a>
        <a
          href="#"
          onClick={openHighlightPage}
          className="text-base text-blue-400 hover:text-blue-300 hover:underline"
        >
          Manage Highlighted Results
        </a>
      </div>
    </div>
  );
}

export default App;
