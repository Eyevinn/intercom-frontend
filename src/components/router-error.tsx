import { useRouteError } from "react-router";
import logger from "../utils/logger";

export const ErrorPage = () => {
  const error = useRouteError();
  logger.red(`Error: ${error}`);

  if (error instanceof Error) {
    return (
      <div id="error-page">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.message || "An unexpected error occurred"}</i>
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1>Oops!</h1>
      <p>An unexpected error occurred.</p>
    </div>
  );
};
