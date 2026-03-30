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
    {
      joinProductionOptions?: {
        productionId: string;
        lineId: string;
        lineUsedForProgramOutput?: boolean;
        isProgramUser?: boolean;
      } | null;
    }
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

    // Use the live URL (not the frozen pendingCallRefs) to determine current order.
    // This prevents a removed-and-re-added call from being restored to its old position.
    const currentUrlRefs = decodeCallsParam(
      new URLSearchParams(window.location.search).get("lines")
    );

    // Keep calls that are currently in the URL in their current order
    const orderedRefs = currentUrlRefs.filter((r) => {
      const key = `${r.productionId}:${r.lineId}`;
      return joinedKeys.has(key) || programKeys.has(key);
    });

    // Append any joined calls not present in the current URL (e.g. added via "Add Call")
    const currentKeys = new Set(
      currentUrlRefs.map((r) => `${r.productionId}:${r.lineId}`)
    );
    const extraRefs: CallRef[] = Object.values(calls)
      .map((c) => c.joinProductionOptions)
      .filter(Boolean)
      .filter((o) => !currentKeys.has(`${o!.productionId}:${o!.lineId}`))
      .map((o) => {
        const ref: CallRef = {
          productionId: o!.productionId,
          lineId: o!.lineId,
        };
        if (o!.lineUsedForProgramOutput) {
          ref.role = o!.isProgramUser ? "p" : "l";
        }
        return ref;
      });

    // Also append any pending program line refs that are not yet in the URL
    // (e.g. a program line that was in the original URL but was temporarily removed).
    const orderedKeys = new Set(
      orderedRefs.map((r) => `${r.productionId}:${r.lineId}`)
    );
    const extraKeys = new Set(
      extraRefs.map((r) => `${r.productionId}:${r.lineId}`)
    );
    const pendingNotInUrl: CallRef[] = (pendingProgramLineRefs ?? [])
      .filter((r) => {
        const key = `${r.productionId}:${r.lineId}`;
        return !orderedKeys.has(key) && !extraKeys.has(key);
      })
      .map((r) => ({ productionId: r.productionId, lineId: r.lineId }));

    const allRefs = [...orderedRefs, ...extraRefs, ...pendingNotInUrl];

    if (allRefs.length > 0) {
      const liveCompanionUrl = parseCompanionParam(
        new URLSearchParams(window.location.search).get("companion")
      );
      const newUrl = buildCallsUrl(allRefs, liveCompanionUrl);
      if (newUrl !== `${window.location.pathname}${window.location.search}`) {
        navigate(newUrl, { replace: true });
      }
    }
  }, [calls, isEmpty, navigate, pendingProgramLineRefs]);

  return { navigate, isEmpty, pendingCallRefs };
};
