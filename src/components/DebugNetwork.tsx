
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DebugNetwork = () => {
    const [status, setStatus] = useState<string>("Testing connection...");
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                const start = performance.now();
                const { data, error } = await supabase.from('app_settings').select('count', { count: 'exact', head: true });
                const end = performance.now();

                if (error) {
                    setStatus("❌ Connection Failed");
                    setDetails({ error, time: end - start });
                } else {
                    setStatus("✅ Connection OK");
                    setDetails({ data, time: end - start });
                }
            } catch (err) {
                setStatus("❌ Network Error (Exception)");
                setDetails(err);
            }
        };

        testConnection();
    }, []);

    if (window.location.hostname !== 'localhost' && !window.location.search.includes('debug=true')) {
        return null; // Hide in prod unless requested
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-green-400 p-4 rounded text-xs font-mono z-50 max-w-sm overflow-auto">
            <p className="font-bold">{status}</p>
            <pre>{JSON.stringify(details, null, 2)}</pre>
        </div>
    );
};

export default DebugNetwork;
