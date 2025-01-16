import styled from "@emotion/styled";
import { DisplayContainer, FlexContainer } from "../generic-components";
import { ActionButton } from "../landing-page/form-elements";
import {
  ProductionItemWrapper,
  HeaderWrapper,
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
      fill: #f96c6c;
    }
  }

  &.unmuted {
    svg {
      fill: #6fd84f;
    }
  }
`;

export const FlexButtonWrapper = styled.div<{ isProgramUser: boolean }>`
  width: 50%;
  padding: 0 1rem 1rem 1rem;

  &.first {
    padding-left: 0;
  }

  &.last {
    padding-right: 0;
    padding-left: ${({ isProgramUser }) => (isProgramUser ? "0" : "1rem")};
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

export const ListWrapper = styled(DisplayContainer)`
  width: 100%;
  padding: 0;
`;

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

export const ProgramOutputIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(50, 56, 59, 1);
  color: #59cbe8;
  border: 0.2rem solid #6d6d6d;
  padding: 0.5rem 1rem;
  width: fit-content;
  height: 4rem;
  border-radius: 0.5rem;
  margin: 0 2rem 2rem 1rem;
  gap: 1rem;
  font-size: 1.2rem;

  svg {
    fill: #59cbe8;
    width: 3.5rem;
  }
`;

export const DeviceButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin: 0;
  }

  .save-button {
    margin-right: 1rem;
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

export const CallContainer = styled(ProductionItemWrapper)`
  margin: 0;
  min-width: 30rem;
  display: flex;
  flex-direction: column;
`;

export const CallHeader = styled(HeaderWrapper)``;

export const MinifiedControls = styled.div`
  padding: 0 2rem 2rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  button {
    margin: 0;
  }
`;

export const MinifiedControlsBlock = styled.div`
  width: 50%;
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
