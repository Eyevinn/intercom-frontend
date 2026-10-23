import styled from "@emotion/styled";
import { isIpad, isMobile } from "../../bowser";
import { ActionButton } from "../form-elements/form-elements";
import {
  DisplayContainer,
  FlexContainer,
  mediaQueries,
} from "../generic-components";
import {
  CollapsibleItemWrapper,
  HeaderWrapper,
} from "../shared/shared-components";

export const CallInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

export const ButtonIcon = styled.div`
  width: 3rem;
  display: inline-block;
  vertical-align: middle;
  margin: 0 auto;

  &.mute {
    svg {
      display: block;
      margin: auto;
      fill: #f96c6c;
    }
  }

  &.unmuted {
    svg {
      display: block;
      margin: auto;
      fill: #6fd84f;
    }
  }
`;

export const UserControlBtn = styled(ActionButton)`
  background: rgba(50, 56, 59, 1);
  border: 0.2rem solid #6d6d6d;
  border-radius: 0.8rem;
  width: 100%;

  &:disabled {
    background: rgba(50, 56, 59, 0.5);
  }

  svg {
    width: 2rem;
  }
`;

export const LongPressWrapper = styled.div`
  touch-action: none;
  margin-bottom: 1rem;
`;

export const PTTWrapper = styled(LongPressWrapper)`
  width: 100%;
  margin-bottom: 0;
  button {
    padding: 1rem;
    line-height: 2rem;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const ListWrapper = styled(DisplayContainer)<{
  isProgramUser?: boolean;
  isProgramLine?: boolean;
}>`
  width: 100%;
  padding: 0;
  margin-top: ${({ isProgramUser, isProgramLine }) =>
    isProgramUser && isProgramLine ? "1rem" : "0"};
`;

// TODO: Decide if we want to reintroduce status text
// const StateText = styled.span<{ state: string }>`
//   font-weight: 700;
//   color: ${({ state }) => {
//     switch (state) {
//       case "connected":
//         return "#7be27b";
//       case "failed":
//         return "#f96c6c";
//       default:
//         return "#ddd";
//     }
//   }};
// `;

export const ConnectionErrorWrapper = styled(FlexContainer)`
  width: 100vw;
  justify-content: center;
  align-items: center;
  padding-top: 12rem;
`;

export const AudioFeedIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #59cbe8;
  font-size: 1.2rem;
  gap: ${({ open }: { open: boolean }) => (open ? "1rem" : "0.5rem")};
  flex-shrink: 0;

  ${({ open }: { open: boolean }) =>
    open
      ? `
    position: absolute;
    top: 5rem;
    left: 2rem;
  `
      : `
    position: static;
  `}

  svg {
    fill: #59cbe8 !important;
    width: 1.5rem !important;
  }
`;

export const DeviceButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin: 0;
  }

  .save-button {
    margin-left: 1rem;
  }
`;

export const LoaderWrapper = styled.div`
  margin-top: 2rem;
  width: 2rem;
  height: 2rem;
`;

export const CallWrapper = styled.div<{
  isSomeoneSpeaking: boolean;
  order?: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0 0 2rem 0;
  flex: 0 0 calc(25% - 2rem);
  ${isMobile ? `flex-grow: 1;` : `flex-grow: 0;`}
  min-width: 35rem;
  max-width: min(49rem, 100%);
  background-color: transparent;
  border-radius: 1rem;
  border: ${({ isSomeoneSpeaking }) =>
    isSomeoneSpeaking ? "0.3rem solid #f96c6c" : "0.3rem solid transparent"};
  transition: border-color 0.3s ease;
  order: ${({ order }) => order ?? 0};

  ${mediaQueries.isLargeScreen} {
    flex: 0 0 calc(33.333% - 2rem);
  }

  ${mediaQueries.isMediumScreen} {
    flex: 0 0 calc(50% - 2rem);
  }

  ${mediaQueries.isSmallScreen} {
    flex: 0 1 100%;
    min-width: 0;
    max-width: 100%;
    margin-bottom: 0;
  }
`;

export const CallContainer = styled(CollapsibleItemWrapper)<{
  isProgramLine?: boolean;
  isVideoEnabled?: boolean;
}>`
  margin: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  border: 0.1rem solid rgba(109, 109, 109, 0.3);
  overflow: hidden;

  background: ${({ isProgramLine, isVideoEnabled }) => {
    if (isVideoEnabled) return "rgba(45, 62, 124, 0.2)";
    if (isProgramLine) return "rgba(73, 67, 124, 0.2)";
    return "rgba(50, 56, 59, 0.4)";
  }};
`;

export const CallHeader = styled(HeaderWrapper)`
  position: relative;
  overflow: visible;
  margin-bottom: ${({ open }: { open: boolean }) =>
    open && (isMobile || isIpad) ? "2rem" : ""};
`;

export const MinifiedControls = styled.div`
  padding: 0 2rem 2rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  align-items: center;
  button {
    margin: 0;
  }
`;

export const MinifiedControlsBlock = styled.div`
  flex-grow: 1;
  display: flex;
  gap: 1rem;
`;

export const MinifiedControlsButton = styled(UserControlBtn)`
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: white;
  line-height: 2rem;
  &.off {
    svg {
      fill: #f96c6c;
    }
  }

  &.on {
    svg {
      fill: #6fd84f;
    }
  }
`;

type PinnedProps = { isPinned: boolean };

export const VideoContainer = styled.div<PinnedProps>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 0.5rem;
  overflow: hidden;
  order: ${({ isPinned }) => (isPinned ? -1 : 0)};
`;

export const Video = styled.video<{ isVideoMuted: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
  display: ${({ isVideoMuted }) => (isVideoMuted ? "none" : "block")};
`;

export const VideoOptionsButton = styled.button<PinnedProps>`
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isPinned }) =>
    isPinned ? "rgba(89, 203, 232, 0.80)" : "rgba(0, 0, 0, 0.45)"};
  border: none;
  border-radius: 0.25rem 0.25rem 0.5rem 0.25rem;
  cursor: pointer;
  padding: 0;
  color: #d9d9d9;

  & svg {
    fill: currentColor;
  }
`;

export const NameTag = styled.span`
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem 0.25rem 0.25rem 0.25rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a1a;
  background-color: rgba(123, 226, 123, 0.82);
  max-width: calc(100% - 0.5rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
`;

export const PinDialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
`;

export const PinDialogPopover = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${({ top }) => `${top}px`};
  left: ${({ left }) => `${left}px`};
  z-index: 201;
`;

export const ListInnerWrapper = styled.div`
  width: 100%;
`;

export const VideoSection = styled.div`
  width: 100%;
`;

export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.5rem;
`;
