import styled from "@emotion/styled";
import { FC } from "react";
import { errorColour } from "../css-helpers/defaults";
import { useGlobalState } from "../global-state/context-provider";

const ErrorDisplay = styled.div`
  width: 100%;
  background: ${errorColour};
  padding: 1rem;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  display: flex;
  align-content: flex-start;
`;

const CloseErrorButton = styled.button`
  border: none;
  background: #1a1a1a;
  color: #ddd;
  font-weight: bold;
  border-radius: 0.5rem;
  margin-left: auto;

  &:hover {
    cursor: pointer;
  }
`;

export const ErrorBanner: FC = () => {
  const [{ error }, dispatch] = useGlobalState();

  return (
    error && (
      <ErrorDisplay>
        {`${error.name}: ${error.message}`}{" "}
        <CloseErrorButton
          type="button"
          onClick={() =>
            dispatch({
              type: "ERROR",
              payload: null,
            })
          }
        >
          close
        </CloseErrorButton>
      </ErrorDisplay>
    )
  );
};
