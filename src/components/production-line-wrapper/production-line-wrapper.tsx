// ProductionLineWrapper.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { CallState } from "../../global-state/types";
import { ProductionLine } from "../production-line/production-line";

export const ProductionLineWrapper = () => {
  const { callId } = useParams();
  const [state] = useGlobalState();
  console.log("state", state);
  const [callState, setCallState] = useState<CallState | null>(null);

  useEffect(() => {
    if (callId) {
      const stored = localStorage.getItem(`callState-${callId}`);
      if (stored) {
        setCallState(JSON.parse(stored));
      }
    }
  }, [callId]);

  if (!callId || !callState) {
    return <div>Call not found or invalid.</div>;
  }
  return (
    <ProductionLine
      id={callId}
      callState={callState}
      shouldReduceVolume={false}
      isSingleCall={false} // optional logic if needed
      customGlobalMute="p"
      masterInputMute={false}
    />
  );
};
