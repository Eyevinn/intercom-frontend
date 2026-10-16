import styled from "@emotion/styled";
import { TRecoveryPhase } from "./use-session-recovery.ts";

const Banner = styled.div<{ failed: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  font-size: 1.6rem;
  color: #fff;
  background: ${({ failed }) => (failed ? "#b3261e" : "#8a5a00")};
`;

const RejoinButton = styled.button`
  font-size: 1.4rem;
  padding: 0.4rem 1.2rem;
  border-radius: 0.4rem;
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  cursor: pointer;
`;

type TProps = {
  phase: TRecoveryPhase;
  onRejoin: () => void;
};

export const ReconnectBanner = ({ phase, onRejoin }: TProps) => {
  if (phase === "ok") return null;

  if (phase === "reconnecting") {
    return (
      <Banner failed={false} role="status">
        Connection to the server was lost. Reconnecting...
      </Banner>
    );
  }

  return (
    <Banner failed role="alert">
      Could not reconnect to the line.
      <RejoinButton type="button" onClick={onRejoin}>
        Rejoin
      </RejoinButton>
    </Banner>
  );
};
