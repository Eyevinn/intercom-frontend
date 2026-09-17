import styled from "@emotion/styled";
import { useState } from "react";
import { PlayIcon, StopIcon } from "../../assets/icons/icon";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";

const START_ACCENT = "#6fae86";
const STOP_ACCENT = "#c98a8a";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 0 0.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1 1 auto;
  min-width: 0;
  font-size: 1.3rem;
`;

const StatusDot = styled.span<{ color: string }>`
  display: block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ color }) => color};
`;

const Name = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const BridgeButton = styled.button<{ accent: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  padding: 0;
  border-radius: 0.4rem;
  background: transparent;
  border: 0.1rem solid
    ${({ accent }) => `color-mix(in srgb, ${accent} 45%, transparent)`};
  color: ${({ accent }) => accent};
  cursor: pointer;

  &:hover:enabled {
    background: ${({ accent }) =>
      `color-mix(in srgb, ${accent} 12%, transparent)`};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  && svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: ${({ accent }) => accent};
    display: block;
  }
`;

const ErrorMessage = styled.div`
  font-size: 1.2rem;
  color: #d6a3a3;
`;

export type TBridgeControlItem = {
  id: string;
  name: string;
  detail?: string;
  status: "idle" | "running" | "stopped" | "failed";
};

const statusColor = (status: TBridgeControlItem["status"]): string => {
  if (status === "running") return START_ACCENT;
  if (status === "failed") return STOP_ACCENT;
  return "#6b6b6b";
};

type TPendingAction = {
  id: string;
  name: string;
  action: "start" | "stop";
};

export type TBridgeVariant = "input" | "output";

type TVariantCopy = {
  noun: string;
  fallbackName: string;
  stopTitle: string;
  stopConfirmation: string;
  startTitle: string;
  startConfirmation: string;
};

const VARIANTS: Record<TBridgeVariant, TVariantCopy> = {
  input: {
    noun: "input",
    fallbackName: "SRT input",
    stopTitle: "Stop input?",
    stopConfirmation: "This ends the SRT feed coming into this line.",
    startTitle: "Start input?",
    startConfirmation: "This starts the SRT feed coming into this line.",
  },
  output: {
    noun: "broadcast",
    fallbackName: "SRT output",
    stopTitle: "Stop broadcast?",
    stopConfirmation: "This ends the SRT output for everyone receiving it.",
    startTitle: "Start broadcast?",
    startConfirmation: "This starts the SRT output for everyone receiving it.",
  },
};

type TBridgeControlsProps = {
  variant: TBridgeVariant;
  bridges: TBridgeControlItem[];
  busyId: string | null;
  error: Error | null;
  canControl?: boolean;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
};

export const BridgeControls = ({
  variant,
  bridges,
  busyId,
  error,
  canControl = true,
  onStart,
  onStop,
}: TBridgeControlsProps) => {
  const [pending, setPending] = useState<TPendingAction | null>(null);
  const copy = VARIANTS[variant];

  return (
    <Wrapper>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      {bridges.map((bridge) => {
        const isRunning = bridge.status === "running";
        const isBusy = busyId === bridge.id;
        const name = bridge.name || copy.fallbackName;
        const actionLabel = `${isRunning ? "Stop" : "Start"} ${copy.noun} ${name}`;
        return (
          <Row key={bridge.id}>
            <Label>
              <StatusDot color={statusColor(bridge.status)} />
              <Name title={bridge.detail || name}>{name}</Name>
            </Label>
            {canControl && (
              <Actions>
                <BridgeButton
                  type="button"
                  accent={isRunning ? STOP_ACCENT : START_ACCENT}
                  disabled={isBusy}
                  onClick={() =>
                    setPending({
                      id: bridge.id,
                      name,
                      action: isRunning ? "stop" : "start",
                    })
                  }
                  aria-label={actionLabel}
                  title={actionLabel}
                >
                  {isRunning ? <StopIcon /> : <PlayIcon />}
                </BridgeButton>
              </Actions>
            )}
          </Row>
        );
      })}
      {pending && (
        <ConfirmationModal
          title={pending.action === "stop" ? copy.stopTitle : copy.startTitle}
          description={
            <>
              Are you sure you want to {pending.action} <em>{pending.name}</em>?
            </>
          }
          confirmationText={
            pending.action === "stop"
              ? copy.stopConfirmation
              : copy.startConfirmation
          }
          onCancel={() => setPending(null)}
          onConfirm={() => {
            if (pending.action === "stop") {
              onStop(pending.id);
            } else {
              onStart(pending.id);
            }
            setPending(null);
          }}
        />
      )}
    </Wrapper>
  );
};
