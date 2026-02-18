import styled from "@emotion/styled";
import { FC, useEffect, useRef } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useP2PCalls } from "../../hooks/use-p2p-calls.ts";

const PanelContainer = styled.div`
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelTitle = styled.h3`
  font-size: 1.3rem;
  color: rgba(89, 203, 232, 0.8);
  margin-bottom: 0.8rem;
`;

const CallCard = styled.div<{ direction: "incoming" | "outgoing" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.4rem;
  background: ${({ direction }) =>
    direction === "incoming"
      ? "rgba(89, 203, 232, 0.08)"
      : "rgba(29, 185, 84, 0.08)"};
  border-radius: 0.4rem;
  border-left: 3px solid
    ${({ direction }) =>
      direction === "incoming"
        ? "rgba(89, 203, 232, 0.6)"
        : "rgba(29, 185, 84, 0.6)"};
`;

const CallInfo = styled.div`
  flex: 1;
`;

const CallName = styled.span`
  font-size: 1.2rem;
  color: white;
  font-weight: bold;
`;

const CallDirection = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 0.5rem;
`;

const CallStatus = styled.span<{ active: boolean }>`
  font-size: 1rem;
  color: ${({ active }) => (active ? "#1db954" : "rgba(255, 255, 255, 0.4)")};
`;

const EndButton = styled.button`
  background: rgba(249, 108, 108, 0.15);
  border: 1px solid rgba(249, 108, 108, 0.4);
  color: #f96c6c;
  border-radius: 0.3rem;
  padding: 0.2rem 0.6rem;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.8rem;
  &:hover {
    background: rgba(249, 108, 108, 0.3);
  }
`;

// PTT button for outgoing calls
const PTTButton = styled.button<{ active: boolean }>`
  background: ${({ active }) =>
    active ? "rgba(249, 108, 108, 0.3)" : "rgba(29, 185, 84, 0.2)"};
  border: 2px solid ${({ active }) => (active ? "#f96c6c" : "#1db954")};
  color: ${({ active }) => (active ? "#f96c6c" : "#1db954")};
  border-radius: 0.4rem;
  padding: 0.3rem 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  user-select: none;
  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ActiveCallsPanel: FC = () => {
  const [{ p2pCalls }] = useGlobalState();
  const { endCall, togglePTT, handleIncomingCall } = useP2PCalls();
  const joiningCallsRef = useRef<Set<string>>(new Set());

  const activeCalls = Object.values(p2pCalls);

  // Auto-join incoming calls
  useEffect(() => {
    for (const call of activeCalls) {
      if (
        call.direction === "incoming" &&
        call.state === "setting_up" &&
        !call.peerConnection &&
        !joiningCallsRef.current.has(call.callId)
      ) {
        joiningCallsRef.current.add(call.callId);
        handleIncomingCall(call.callId, call.callerId, call.callerName).finally(
          () => joiningCallsRef.current.delete(call.callId)
        );
      }
    }
  }, [activeCalls, handleIncomingCall]);

  if (activeCalls.length === 0) return null;

  return (
    <PanelContainer>
      <PanelTitle>Active Calls ({activeCalls.length})</PanelTitle>
      {activeCalls.map((call) => {
        const otherName =
          call.direction === "outgoing" ? call.calleeName : call.callerName;
        const isOutgoing = call.direction === "outgoing";
        const isTalking = Boolean(call.isTalking);

        return (
          <CallCard key={call.callId} direction={call.direction}>
            <CallInfo>
              <div>
                <CallName>{otherName}</CallName>
                <CallDirection>
                  {isOutgoing ? "→ calling" : "← from"}
                </CallDirection>
              </div>
              <div>
                <CallStatus active={call.state === "active"}>
                  {call.state === "setting_up" ? "Connecting..." : "Active"}
                </CallStatus>
              </div>
            </CallInfo>
            <ButtonGroup>
              {call.state === "active" && (
                <PTTButton
                  active={isTalking}
                  onMouseDown={() => togglePTT(call.callId, true)}
                  onMouseUp={() => togglePTT(call.callId, false)}
                  onMouseLeave={() => togglePTT(call.callId, false)}
                  onTouchStart={() => togglePTT(call.callId, true)}
                  onTouchEnd={() => togglePTT(call.callId, false)}
                >
                  PTT
                </PTTButton>
              )}
              <EndButton onClick={() => endCall(call.callId)}>End</EndButton>
            </ButtonGroup>
          </CallCard>
        );
      })}
    </PanelContainer>
  );
};
