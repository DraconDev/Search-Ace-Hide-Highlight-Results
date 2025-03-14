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

    return <>
    <div className="min-h-screen p-4 bg-gray-100">
        <header className="flex items-center justify-center gap-4 mb-6">
            <img src={reactLogo} className="h-10" alt="React logo" />
            <img src={wxtLogo} className="h-10" alt="WXT logo" />
            <h1 className="text-2xl font-bold">WXT Extension</h1>
        </header>

        <div className="p-6 bg-white rounded-lg shadow">
            {state ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Current State</h2>
                    <pre className="p-3 overflow-auto rounded bg-gray-50">
                        {JSON.stringify(state, null, 2)}
                    </pre>
                    
                    <div className="flex justify-between mt-4">
                        <button 
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                            onClick={async () => {
                                await store.setValue({
                                    ...state,
                                    lastUpdated: new Date().toISOString()
                                });
                            }}
                        >
                            Update Timestamp
                        </button>
                        
                        <button 
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={async () => {
                                await store.setValue(null);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-gray-500">Loading state or no data available...</p>
                    <button 
                        className="px-4 py-2 mt-4 text-white bg-green-500 rounded hover:bg-green-600"
                        onClick={async () => {
                            await store.setValue({ initialized: true, lastUpdated: new Date().toISOString() });
                        }}
                    >
                        Initialize State
                    </button>
                </div>
            )}
        </div>
    </div>
    
    </>;
}

export default App;
