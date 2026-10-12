import styled from "@emotion/styled";
import {
  LogoutIcon,
  MicMuted,
  SettingsIcon,
  UserIcon,
  WhipIcon,
} from "../../assets/icons/icon.tsx";
import { Modal } from "../modal/modal.tsx";
import {
  PrimaryButton,
  SecondaryButton,
} from "../form-elements/form-elements.ts";
import { TParticipant } from "./types.ts";

// Foundational admin-panel UI for issue #636 (sub-issue of #280). This panel
// houses admin-only actions so they are not immediately visible to every
// participant. The mute and kick controls are intentionally rendered as
// disabled placeholder slots here — the actual behaviour is delivered by the
// sibling issues (#676 / #637 / #638).

const EmptyState = styled.p`
  color: #ddd;
  margin: 0;
  padding: 1rem 0;
`;

const ListWrapper = styled.div`
  border-radius: 1rem;
  border: 0.2rem solid #434343;
`;

type TParticipantRowProps = {
  isYou: boolean;
};

const ParticipantRow = styled.div<TParticipantRowProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #1a1a1a;
  color: #ddd;
  border: transparent;
  border-bottom: 0.1rem solid #464646;

  &:only-of-type {
    border-radius: 1rem;
    border-bottom: 0;
  }

  &:first-of-type:not(:only-of-type) {
    border-radius: 1rem 1rem 0 0;
  }

  &:last-of-type:not(:only-of-type) {
    border-radius: 0 0 1rem 1rem;
    border-bottom: 0;
  }

  svg {
    fill: #4d4d4d;
    width: 2rem;
  }

  ${({ isYou }) => (isYou ? `background: #353434;` : "")}
`;

const Participant = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
`;

const StatusIndicator = styled.div`
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 5rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c7c7c7;
  flex-shrink: 0;

  &.user {
    background: #7be27b;
  }

  &.whip {
    background: rgb(89, 203, 232);
  }
`;

const ParticipantName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  line-height: 1.5;
  padding-bottom: 0.2rem;
`;

const ParticipantControls = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const PlaceholderButton = styled.button`
  width: 3rem;
  height: 3rem;
  padding: 0.3rem;
  margin: 0 0 0 0.5rem;
  background: #302b2b;
  border: 0.1rem solid #707070;
  border-radius: 0.4rem;
  cursor: not-allowed;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    fill: #f96c6c;
    display: block;
    width: 2rem;
  }
`;

const PlaceholderNote = styled.p`
  color: #a0a0a0;
  font-size: 1.2rem;
  margin: 1rem 0 0;
`;

const CloseButton = styled(PrimaryButton)`
  margin-top: 1.5rem;
  width: 100%;
  justify-content: center;
`;

const OpenButton = styled(SecondaryButton)`
  margin-top: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

type TAdminPanelButtonProps = {
  onClick: () => void;
};

export const AdminPanelButton = ({ onClick }: TAdminPanelButtonProps) => {
  return (
    <OpenButton
      type="button"
      title="Open admin panel"
      aria-label="Open admin panel"
      onClick={onClick}
    >
      <SettingsIcon />
      Admin panel
    </OpenButton>
  );
};

type TAdminPanelProps = {
  participants: TParticipant[];
  sessionId: string | null;
  onClose: () => void;
};

export const AdminPanel = ({
  participants,
  sessionId,
  onClose,
}: TAdminPanelProps) => {
  const getStatusClass = (isActive: boolean, isWhip: boolean) => {
    if (!isActive) return "inactive";
    return isWhip ? "whip" : "user";
  };

  return (
    <Modal onClose={onClose} title="Admin panel">
      {participants.length === 0 ? (
        <EmptyState>No participants in this line yet.</EmptyState>
      ) : (
        <ListWrapper>
          {participants.map((p) => {
            const isYou = p.sessionId === sessionId;
            const truncatedName =
              p.name.length > 40 ? `${p.name.slice(0, 40)}...` : p.name;
            return (
              <ParticipantRow key={p.sessionId} isYou={isYou}>
                <Participant title={p.name}>
                  <StatusIndicator
                    className={getStatusClass(p.isActive, p.isWhip)}
                  >
                    {(p.isWhip && <WhipIcon />) || <UserIcon />}
                  </StatusIndicator>
                  <ParticipantName>
                    {truncatedName} {p.isActive ? "" : "(inactive)"}
                  </ParticipantName>
                </Participant>
                {!isYou && !p.isWhip && (
                  <ParticipantControls>
                    <PlaceholderButton
                      type="button"
                      disabled
                      aria-label={`Mute ${p.name} (coming soon)`}
                      title="Mute — coming soon"
                    >
                      <MicMuted />
                    </PlaceholderButton>
                    <PlaceholderButton
                      type="button"
                      disabled
                      aria-label={`Kick ${p.name} (coming soon)`}
                      title="Kick — coming soon"
                    >
                      <LogoutIcon />
                    </PlaceholderButton>
                  </ParticipantControls>
                )}
              </ParticipantRow>
            );
          })}
        </ListWrapper>
      )}
      <PlaceholderNote>Mute and kick controls are coming soon.</PlaceholderNote>
      <CloseButton type="button" onClick={onClose}>
        Close
      </CloseButton>
    </Modal>
  );
};
