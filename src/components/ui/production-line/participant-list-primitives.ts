import styled from "@emotion/styled";

// Shared presentational primitives and helpers for participant lists. Both the
// in-call UserList (user-list.tsx) and the admin panel (admin-panel.tsx) render
// the same list of participants, so the row chrome, status indicator, name
// styling, status-class helper and name-truncation logic live here to keep the
// two views from drifting apart visually.

export const ListWrapper = styled.div`
  border-radius: 1rem;
  border: 0.2rem solid #434343;
`;

export type TParticipantRowProps = {
  isYou: boolean;
};

export const ParticipantRow = styled.div<TParticipantRowProps>`
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

export const Participant = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
`;

export const ParticipantName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  /* Prevent descenders (j, g, y, p, q) from being clipped by overflow: hidden */
  line-height: 1.5;
  padding-bottom: 0.2rem;
`;

export const OnlineIndicator = styled.div`
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c7c7c7;

  &.user {
    background: #7be27b;
  }

  &.whip {
    background: rgb(89, 203, 232);
  }
`;

export const ParticipantControls = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const getStatusClass = (isActive: boolean, isWhip: boolean) => {
  if (!isActive) return "inactive";
  return isWhip ? "whip" : "user";
};

export const truncateParticipantName = (name: string) =>
  name.length > 40 ? `${name.slice(0, 40)}...` : name;
