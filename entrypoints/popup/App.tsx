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
    <div className="p-6 text-gray-100 bg-gray-900 rounded-lg shadow-xl min-w-[400px]">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="mx-auto text-xl font-bold text-white">
          Search Results Manager
        </h1>
      </div>
      <div className="flex flex-col gap-3 mb-6">
        <a
          href="#"
          onClick={openHiddenPage}
          className="block w-full px-4 py-2 text-base font-semibold text-center text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700"
        >
          Hidden Results
        </a>
        <a
          href="#"
          onClick={openHighlightPage}
          className="block w-full px-4 py-2 text-base font-semibold text-center text-white transition-colors duration-200 bg-green-600 rounded-md hover:bg-green-700"
        >
          Highlighted Results
        </a>
      </div>
      <div className="flex justify-center">
        <button
          onClick={toggleSuspended}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
            state.suspended
              ? "bg-green-600 hover:bg-green-700"
              : "bg-yellow-600 hover:bg-yellow-700"
          } text-white w-full`}
        >
          {state.suspended ? "Resume" : "Suspend"}
        </button>
      </div>
    </div>
  );
}

export default App;
