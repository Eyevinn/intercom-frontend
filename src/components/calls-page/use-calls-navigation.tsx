import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  buildCallsUrl,
  CallRef,
  decodeCallsParam,
  parseCompanionParam,
} from "../../utils/call-url";

export const useCallsNavigation = ({
  isEmpty,
  paramProductionId,
  paramLineId,
  calls,
  pendingProgramLineRefs,
}: {
  isEmpty: boolean;
  paramProductionId?: string;
  paramLineId?: string;
  calls?: Record<
    string,
    { joinProductionOptions?: { productionId: string; lineId: string } | null }
  >;
  pendingProgramLineRefs?: { productionId: string; lineId: string }[];
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pendingCallRefs: CallRef[] = useMemo(
    () => decodeCallsParam(searchParams.get("lines")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const companionUrl = useMemo(
    () => parseCompanionParam(searchParams.get("companion")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (
      isEmpty &&
      !paramProductionId &&
      !paramLineId &&
      pendingCallRefs.length === 0
    ) {
      navigate("/");
    }
  }, [
    isEmpty,
    paramProductionId,
    paramLineId,
    pendingCallRefs.length,
    navigate,
  ]);

  useEffect(() => {
    if (!calls || isEmpty) return;

    const joinedKeys = new Set(
      Object.values(calls)
        .map((c) => c.joinProductionOptions)
        .filter(Boolean)
        .map((o) => `${o!.productionId}:${o!.lineId}`)
    );

    const programKeys = new Set(
      (pendingProgramLineRefs ?? []).map((r) => `${r.productionId}:${r.lineId}`)
    );

    // Preserve original URL order: keep refs that are joined OR still pending as program cards
    const orderedRefs = pendingCallRefs.filter((r) => {
      const key = `${r.productionId}:${r.lineId}`;
      return joinedKeys.has(key) || programKeys.has(key);
    });

    // Append any extra joined calls not present in the original URL (e.g. added via "Add Call")
    const originalKeys = new Set(
      pendingCallRefs.map((r) => `${r.productionId}:${r.lineId}`)
    );
    const extraRefs = Object.values(calls)
      .map((c) => c.joinProductionOptions)
      .filter(Boolean)
      .filter((o) => !originalKeys.has(`${o!.productionId}:${o!.lineId}`))
      .map((o) => ({ productionId: o!.productionId, lineId: o!.lineId }));

    const allRefs = [...orderedRefs, ...extraRefs];

    if (allRefs.length > 0) {
      const newUrl = buildCallsUrl(allRefs, companionUrl);
      if (newUrl !== `${window.location.pathname}${window.location.search}`) {
        navigate(newUrl, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calls, isEmpty, navigate, pendingProgramLineRefs]);

  return { navigate, isEmpty, pendingCallRefs };
};
