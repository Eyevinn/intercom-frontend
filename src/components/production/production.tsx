import { FC, useEffect } from "react";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { backgroundColour } from "../../css-helpers/defaults.ts";
import { fetchProduction } from "./production-api.ts";
import { noop } from "../../helpers.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";

const UserList = styled.div`
  padding: 1rem;
  background: ${backgroundColour};
`;

export const Production: FC = () => {
  const { productionId /* , lineId */ } = useParams();
  const [{ production }, dispatch] = useGlobalState();

  // TODO if param productionId/lineId is defined but no production in global state
  //  it means user navigated here by clicking a link. Present name/mic/speaker input
  //  then fetch the production, and use the lineId from the URL to establish connection.

  // TODO move into separate useFetchProduction hook
  useEffect(() => {
    let aborted = false;

    // If we already have a production, do nothing
    if (production) return noop;

    // Should not be a real scenario, but keeps typescript happy
    if (!productionId) return noop;

    const productionIdAsNumber = parseInt(productionId, 10);

    if (Number.isNaN(productionIdAsNumber)) {
      // Someone entered a production id in the URL that's not a number
      // TODO dispatch error
      return noop;
    }

    fetchProduction(productionIdAsNumber).then((payload) => {
      if (aborted) return;

      dispatch({
        type: "UPDATE_PRODUCTION",
        payload,
      });
    });

    return () => {
      aborted = true;
    };
  }, [dispatch, production, productionId]);

  // TODO pretty spinner component
  if (!production) return <div>LOADING</div>;

  // TODO if (!lineId) return <LineIdSelector />

  // Mute/Unmute mic
  // Mute/Unmute speaker
  // Show active sink and mic
  // Exit button (link to /, clear production from state)
  return <UserList>{JSON.stringify(production)}</UserList>;
};
