import { useCallback, useEffect, useState } from "react";
import { getStatus } from "../api/client.js";

export function useStatus(forceSpecial = false) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const json = await getStatus();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
    if (!forceSpecial) {
      refresh();
    }
  }, [refresh, forceSpecial]);

  return { data, loading, refresh };
}

