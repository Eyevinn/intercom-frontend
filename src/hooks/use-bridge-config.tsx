import { useEffect, useState } from "react";
import { API, TBridgeConfig } from "../api/api";

export const useBridgeConfig = () => {
  const [config, setConfig] = useState<TBridgeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await API.fetchBridgeConfig();
        setConfig(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch bridge config:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch bridge config"
        );
        // If config endpoint fails, assume no gateways are available
        setConfig({ whipGatewayEnabled: false, whepGatewayEnabled: false });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};
