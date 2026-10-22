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
import {
  getStatusClass,
  ListWrapper,
  OnlineIndicator,
  Participant,
  ParticipantControls,
  ParticipantName,
  ParticipantRow,
  truncateParticipantName,
} from "./participant-list-primitives.ts";

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

// The admin panel renders the status indicator directly inside the row (there
// is no surrounding "is talking" wrapper like in UserList), so it extends the
// shared OnlineIndicator with the spacing that wrapper would otherwise provide.
const StatusIndicator = styled(OnlineIndicator)`
  margin-right: 1rem;
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
  background: transparent;
  border: 0.2rem solid rgba(89, 203, 232, 1);
  color: rgba(89, 203, 232, 1);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
    flex-shrink: 0;
    fill: currentColor;
    transform: translateY(-0.1rem);
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
  programOutputLine?: boolean;
  onClose: () => void;
};

export const AdminPanel = ({
  participants,
  sessionId,
  programOutputLine,
  onClose,
}: TAdminPanelProps) => {
  return (
    <Modal onClose={onClose} title="Admin panel">
      {participants.length === 0 ? (
        <EmptyState>No participants in this line yet.</EmptyState>
      ) : (
        <ListWrapper>
          {participants.map((p) => {
            const isYou = p.sessionId === sessionId;
            const truncatedName = truncateParticipantName(p.name);
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
                {/*
                  Eligibility must match UserList (user-list.tsx) exactly so the
                  two participant views stay consistent: skip yourself, inactive
                  participants, program-output lines and WHIP ingests.

                  These mute/kick slots are intentionally disabled placeholders.
                  The functional mute/kick controls currently live in UserList
                  (#673), rendered directly above the admin-panel button. This
                  panel is the intended eventual home for those controls, so the
                  temporary coexistence is deliberate rather than an oversight.
                */}
                {!isYou && p.isActive && !programOutputLine && !p.isWhip && (
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
