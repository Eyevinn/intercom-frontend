import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useGlobalState } from "../../global-state/context-provider";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { AUTO_JOIN_STORAGE_KEY, TAutoJoinCall } from "../../utils/auto-join";

export const AutoJoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [{ userSettings, devices }, dispatch] = useGlobalState();
  const { initiateProductionCall } = useInitiateProductionCall({ dispatch });
  const hasInitiated = useRef(false);

  useEffect(() => {
    if (hasInitiated.current) return;

    const callsParam = searchParams.get("calls") ?? "";
    const usernameParam = searchParams.get("username");
    const companionParam = searchParams.get("companion");
    const username = usernameParam || userSettings?.username || "Auto";

    const calls: TAutoJoinCall[] = callsParam
      .split(",")
      .map((pair) => pair.split(":"))
      .filter(([p, l]) => p && l)
      .map(([productionId, lineId]) => ({ productionId, lineId }));

    if (calls.length === 0) {
      navigate("/");
      return;
    }

    hasInitiated.current = true;

    localStorage.setItem(AUTO_JOIN_STORAGE_KEY, JSON.stringify(calls));

    if (companionParam) {
      localStorage.setItem("companion_auto_connect", companionParam);
    }

    const audiooutput = userSettings?.audiooutput;
    const audioinput =
      userSettings?.audioinput || devices?.input?.[0]?.deviceId;

    Promise.all(
      calls.map((call) =>
        initiateProductionCall({
          payload: {
            joinProductionOptions: {
              productionId: call.productionId,
              lineId: call.lineId,
              username,
              audioinput,
              lineUsedForProgramOutput: false,
              isProgramUser: false,
            },
            audiooutput,
          },
        })
      )
    ).then(() => navigate("/production-calls"));
  }, [searchParams, userSettings, devices, navigate, initiateProductionCall]);

  return null;
};
