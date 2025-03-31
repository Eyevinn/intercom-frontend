import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../../global-state/context-provider";
import { CallState } from "../../global-state/types";
import { ProductionLine } from "./production-line";
import { SymphonyRtcConnectionComponent } from "./symphony-rtc-connection-component";
import { useAudioInput } from "./use-audio-input";

export const ProductionLineWrapper = () => {
  const { callId } = useParams();
  const [{ calls }, dispatch] = useGlobalState();
  const [callState, setCallState] = useState<CallState | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [connectionActive, setConnectionActive] = useState(true);

  // Get initial state from localStorage
  useEffect(() => {
    if (callId) {
      const stored = localStorage.getItem(`callState-${callId}`);
      if (stored) {
        try {
          const parsedState = JSON.parse(stored);
          console.log(
            "[ProductionLineWrapper] Initial state from localStorage"
          );
          setCallState(parsedState);

          // Notify parent that we're ready
          window.parent.postMessage(
            {
              type: "IFRAME_READY",
              data: { callId },
            },
            "*"
          );
        } catch (err) {
          console.error(
            "[ProductionLineWrapper] Error parsing stored call state:",
            err
          );
        }
      } else {
        console.warn(
          `[ProductionLineWrapper] No stored state found for call ${callId}`
        );
      }
    }
  }, [callId]);

  // Listen for updates to the global state within the iframe
  useEffect(() => {
    if (callId && calls[callId]) {
      // Update the local state with the latest from global state
      setCallState((prevState) => {
        if (!prevState) return calls[callId];

        // Merge the previous state with the new state
        return {
          ...prevState,
          ...calls[callId],
        };
      });

      console.log(
        "[ProductionLineWrapper] Updated callState from global state:",
        calls[callId]
      );
    }
  }, [callId, calls]);

  useEffect(() => {
    if (callState?.joinProductionOptions) {
      setConnectionActive(true);
    }
  }, [callState?.joinProductionOptions]);

  useEffect(() => {
    console.log("[ProductionLineWrapper] Calls:", calls);
  }, [calls]);

  useEffect(() => {
    console.log("[ProductionLineWrapper] CallState:", callState);
  }, [callState]);

  // Send height updates to parent window
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Function to measure and send height
    const sendHeight = () => {
      if (wrapperRef.current && callId) {
        const height = wrapperRef.current.scrollHeight;
        window.parent.postMessage(
          {
            type: "IFRAME_RESIZE",
            data: { callId, height },
          },
          "*"
        );
      }
    };

    // Send initial height
    sendHeight();

    // Set up a resize observer to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(wrapperRef.current);

    // Also set up an interval as a fallback
    const intervalId = setInterval(sendHeight, 1000);

    // eslint-disable-next-line consistent-return
    return () => {
      resizeObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [callId, callState]);

  // Set up audio input for the WebRTC connection
  const [inputAudioStream] = useAudioInput({
    audioInputId: callState?.joinProductionOptions?.audioinput ?? null,
  });

  if (!callId || !callState || !callState.joinProductionOptions) {
    return <div>Loading call data...</div>;
  }

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      {/* Include the RTC connection component to establish the connection */}
      {connectionActive && (
        <SymphonyRtcConnectionComponent
          joinProductionOptions={callState.joinProductionOptions}
          audiooutput={callState.audiooutput}
          inputAudioStream={inputAudioStream}
          callId={callId}
          dispatch={dispatch}
          isIframe
        />
      )}
      {/* // TODO: Solve problem with missing props from calls-page:
      //  - shouldReduceVolume
      //  - customGlobalMute
      //  - masterInputMute
      //  */}
      <ProductionLine
        id={callId}
        callState={callState}
        shouldReduceVolume={false}
        customGlobalMute="p"
        masterInputMute={false}
        setConnectionActive={() => setConnectionActive(false)}
      />
    </div>
  );
};
