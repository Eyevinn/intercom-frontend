import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { buildCallsUrl, CallRef, decodeCallsParam } from "../../utils/call-url";

export const useCallsNavigation = ({
  isEmpty,
  paramProductionId,
  paramLineId,
  calls,
}: {
  isEmpty: boolean;
  paramProductionId?: string;
  paramLineId?: string;
  calls?: Record<
    string,
    { joinProductionOptions?: { productionId: string; lineId: string } | null }
  >;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pendingCallRefs: CallRef[] = useMemo(
    () => decodeCallsParam(searchParams.get("calls")),
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
    const currentCallRefs: CallRef[] = Object.values(calls)
      .map((c) => c.joinProductionOptions)
      .filter(Boolean)
      .map((o) => ({ productionId: o!.productionId, lineId: o!.lineId }));
    if (currentCallRefs.length > 0) {
      navigate(buildCallsUrl(currentCallRefs), { replace: true });
    }
  }, [calls, isEmpty, navigate]);

  return { navigate, isEmpty, pendingCallRefs };
};
