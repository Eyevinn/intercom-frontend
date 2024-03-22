import { FC, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { backgroundColour } from "../../css-helpers/defaults.ts";
import { fetchProduction } from "./production-api.ts";
import { TProduction } from "./types.ts";

const UserList = styled.div`
  padding: 1rem;
  background: ${backgroundColour};
`;

export const Production: FC = () => {
  const [production, setProduction] = useState<TProduction | null>(null);

  // dummy production fetch
  useEffect(() => {
    let aborted = false;

    fetchProduction().then((p) => {
      if (aborted) return;

      setProduction(p);
    });

    return () => {
      aborted = true;
    };
  }, []);

  if (!production) return <div>LOADING</div>;

  // Mute/Unmute mic
  // Mute/Unmute speaker
  // Show active sink and mic
  return (
    <UserList>
      {production.name}: {JSON.stringify(production.lines)}
    </UserList>
  );
};
