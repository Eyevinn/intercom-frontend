import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import { errorColour } from "../css-helpers/defaults";
import { useGlobalState } from "../global-state/context-provider";
import logger from "../utils/logger";

const formatErrorMessage = (
  error: (Error & { status?: number }) | null | undefined
): string => {
  if (!error) return "An unexpected error occurred";
  const message = error.message || "An unexpected error occurred";
  if (error.status) {
    return `Error: ${error.status} - ${message}`;
  }
  return `Error: ${message}`;
};

const formatCallErrorMessage = (
  message: string,
  error: (Error & { status?: number }) | null | undefined
): string => {
  if (error?.status) {
    return `Error: ${error.status} - ${message}`;
  }
  return `Error: ${message}`;
};

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
  const [{ error, apiError }, dispatch] = useGlobalState();

  useEffect(() => {
    const displayedMessages = new Set<string>();
    if (error.callErrors) {
      Object.entries(error.callErrors).forEach(([, singleError]) => {
        if (singleError) {
          const formatted = formatCallErrorMessage(
            singleError.message,
            singleError as Error & { status?: number }
          );
          if (!displayedMessages.has(formatted)) {
            logger.red(formatted);
            displayedMessages.add(formatted);
          }
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

  if (apiError) return null;

  return (
    <>
      {error.globalError && (
        <ErrorDisplay>
          {formatErrorMessage(error.globalError as Error & { status?: number })}{" "}
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
  return (
    <ErrorDisplay>
      {formatErrorMessage(error as Error & { status?: number })}{" "}
    </ErrorDisplay>
  );
};
