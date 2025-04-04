import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import { errorColour } from "../css-helpers/defaults";
import { useGlobalState } from "../global-state/context-provider";
import logger from "../utils/logger";

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
  const [callError, setCallError] = useState<string[] | null>(null);
  const [{ error }, dispatch] = useGlobalState();

  useEffect(() => {
    const displayedMessages = new Set<string>();
    if (error.callErrors) {
      Object.entries(error.callErrors).forEach(([, singleError]) => {
        if (singleError && !displayedMessages.has(singleError.message)) {
          logger.red(`Error: ${singleError.message}`); // Display only unique errors
          displayedMessages.add(singleError.message);
        }
      });
      const uniqueErrors = Array.from(displayedMessages);
      setCallError(uniqueErrors);
    }
  }, [error.callErrors]);

  const resetError = () => {
    if (error.callErrors) {
      Object.entries(error.callErrors).forEach(([callId]) => {
        setCallError(null);
        dispatch({
          type: "ERROR",
          payload: { callId, error: null },
        });
      });
    }
  };

  return (
    <>
      {error.globalError && (
        <ErrorDisplay>
          {`${error.globalError.name}: ${error.globalError.message}`}{" "}
          <CloseErrorButton
            type="button"
            onClick={() =>
              dispatch({
                type: "ERROR",
                payload: { error: null },
              })
            }
          >
            close
          </CloseErrorButton>
        </ErrorDisplay>
      )}
      {callError &&
        error.callErrors &&
        callError.map((uniqueErrors) => (
          <ErrorDisplay key={uniqueErrors}>
            {uniqueErrors}{" "}
            <CloseErrorButton type="button" onClick={() => resetError()}>
              close
            </CloseErrorButton>
          </ErrorDisplay>
        ))}
    </>
  );
};

export const LocalError = ({ error }: { error: Error }) => {
  return <ErrorDisplay>{`${error.name}: ${error.message}`} </ErrorDisplay>;
};
