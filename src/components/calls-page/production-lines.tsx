import { ProductionLine } from "../production-line/production-line";
import { CallState } from "../../global-state/types";

type ProductionLinesProps = {
  calls: Record<string, CallState>;
  shouldReduceVolume: boolean;
  isSingleCall: boolean;
  customGlobalMute: string;
  isMasterInputMuted: boolean;
  setAddCallActive: (addCallActive: boolean) => void;
};

export const ProductionLines = ({
  calls,
  shouldReduceVolume,
  isSingleCall,
  customGlobalMute,
  isMasterInputMuted,
  setAddCallActive,
}: ProductionLinesProps) => (
  <>
    {Object.entries(calls)
      .toReversed()
      .map(
        ([callId, callState]) =>
          callId &&
          callState.joinProductionOptions && (
            <ProductionLine
              key={callId}
              id={callId}
              shouldReduceVolume={shouldReduceVolume}
              callState={callState}
              isSingleCall={isSingleCall}
              customGlobalMute={customGlobalMute}
              masterInputMute={isMasterInputMuted}
              setFailedToConnect={() => setAddCallActive(true)}
            />
          )
      )}
  </>
);
