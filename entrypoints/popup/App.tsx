import { useState, useEffect } from "react";
import { MemoryRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Store } from "@/types/types";
import { store } from "@/utils/store";
import HiddenResultsPage from "./HiddenResultsPage";
import HighlightedResultsPage from "./HighlightedResultsPage";

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
    <Router>
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

        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-500 hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/hidden" className="text-blue-500 hover:underline">Hidden Results</Link>
            </li>
            <li>
              <Link to="/highlighted" className="text-blue-500 hover:underline">Highlighted Results</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage state={state} toggleSuspended={toggleSuspended} />} />
          <Route path="/hidden" element={<HiddenResultsPage state={state} />} />
          <Route path="/highlighted" element={<HighlightedResultsPage state={state} />} />
        </Routes>
      </div>
    </Router>
  );
}

// Create a simple Home Page component for now
function HomePage({ state, toggleSuspended }: { state: Store, toggleSuspended: () => void }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-bold">Welcome</h2>
      <p>Use the navigation above to manage your hidden and highlighted search results.</p>
    </div>
  );
}


export default App;
