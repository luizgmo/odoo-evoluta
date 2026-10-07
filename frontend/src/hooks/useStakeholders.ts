import { useCallback, useEffect, useState } from "react";
import { listarStakeholders, type Stakeholder } from "@/services/api/stakeholders";

export function useStakeholders(projectId: number | undefined) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(() => {
    if (!projectId || !Number.isFinite(projectId)) {
      setStakeholders([]);
      setError(new Error("Projeto inválido."));
      setIsLoading(false);
      return Promise.resolve();
    }

    setIsLoading(true);
    setError(null);
    return listarStakeholders(projectId)
      .then((resposta) => setStakeholders(resposta.records))
      .catch((erro) => setError(erro))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stakeholders, isLoading, error, isError: !!error, refetch };
}
