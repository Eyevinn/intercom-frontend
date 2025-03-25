import styled from "@emotion/styled";
import { DisplayContainer, FlexContainer } from "../generic-components";
import { ActionButton } from "../landing-page/form-elements";
import {
  HeaderWrapper,
  ProductionItemWrapper,
} from "../production-list/production-list-components";

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
`;

export const PTTWrapper = styled(LongPressWrapper)`
  width: 100%;
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
  gap: 1rem;
  position: absolute;
  top: ${({ open }: { open: boolean }) => (open ? "5rem" : "2.35rem")};
  left: ${({ open }: { open: boolean }) => (open ? "2rem" : "1.5rem")};

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

export const CallWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0 0 2rem 0;
  min-width: 20rem;
`;

export const CallContainer = styled(ProductionItemWrapper)<{
  isProgramLine?: boolean;
}>`
  margin: 0;
  min-width: 30rem;
  display: flex;
  flex-direction: column;

  background: ${({ isProgramLine }) =>
    isProgramLine ? "rgba(73, 67, 124, 0.2)" : "transparent"};
`;

export const CallHeader = styled(HeaderWrapper)`
  position: relative;
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
