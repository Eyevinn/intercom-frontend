import styled from "@emotion/styled";
import { FC } from "react";
import { errorColour } from "../../css-helpers/defaults.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";

const ErrorDisplay = styled.div`
  width: 100%;
  background: ${errorColour};
  padding: 1rem;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`;

export const Error: FC = () => {
  const [{ error }] = useGlobalState();

  return error && <ErrorDisplay>Something went wrong</ErrorDisplay>;
};
