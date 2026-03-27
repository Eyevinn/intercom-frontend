import styled from "@emotion/styled";
import { useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { PrimaryButton } from "../form-elements/form-elements";
import { Checkbox } from "../checkbox/checkbox";
import { CheckboxWrapper } from "../landing-page/join-production-components";

const CardContainer = styled.div<{ order?: number }>`
  padding: 2rem;
  border: 0.1rem solid rgba(109, 109, 109, 0.3);
  border-radius: 1rem;
  background: rgba(73, 67, 124, 0.2);
  flex: 0 0 calc(25% - 2rem);
  flex-grow: 0;
  min-width: 30rem;
  order: ${({ order }) => order ?? 0};

  @media (max-width: 1440px) {
    flex: 0 0 calc(33.333% - 2rem);
  }

  @media (max-width: 1024px) {
    flex: 0 0 calc(50% - 2rem);
  }

  @media (max-width: 768px) {
    flex: 0 0 calc(100%);
    min-width: 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const CardTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
`;

const CardSubtitle = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const RoleLabel = styled.p`
  margin: 0 0 1rem;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.75);
`;

const ButtonRow = styled.div`
  margin: 2rem 0 0 0;
  display: flex;
  justify-content: flex-end;
`;

const JoinBtn = styled(PrimaryButton)`
  padding: 0.6rem 1.4rem;
  font-size: 1.4rem;
`;

type ProgramLineJoinCardProps = {
  productionId: string;
  lineId: string;
  lineName?: string;
  productionName?: string;
  presetOrder: number;
  customGlobalMute: string;
  onJoined: () => void;
};

export const ProgramLineJoinCard = ({
  productionId,
  lineId,
  lineName,
  productionName,
  presetOrder,
  customGlobalMute,
  onJoined,
}: ProgramLineJoinCardProps) => {
  const [isProgramUser, setIsProgramUser] = useState(false);
  const [{ userSettings }, dispatch] = useGlobalState();
  const { initiateProductionCall } = useInitiateProductionCall({ dispatch });

  const displayName = lineName || lineId;

  const handleJoin = async () => {
    if (!userSettings?.username) return;

    const success = await initiateProductionCall({
      payload: {
        joinProductionOptions: {
          productionId,
          lineId,
          username: userSettings.username,
          audioinput: userSettings.audioinput,
          lineUsedForProgramOutput: true,
          isProgramUser,
          lineName,
        },
        audiooutput: userSettings.audiooutput,
      },
      customGlobalMute,
    });

    if (success) {
      onJoined();
    }
  };

  return (
    <CardContainer order={presetOrder}>
      <CardHeader>
        <CardTitleWrapper>
          <CardTitle title={displayName}>{displayName}</CardTitle>
          {productionName && (
            <CardSubtitle title={productionName}>{productionName}</CardSubtitle>
          )}
        </CardTitleWrapper>
      </CardHeader>
      <RoleLabel>
        This is a line for audio feed. Join as listener or audio feed?
      </RoleLabel>
      <CheckboxWrapper>
        <Checkbox
          label="Listener"
          checked={!isProgramUser}
          onChange={() => setIsProgramUser(false)}
        />
        <Checkbox
          label="Audio feed"
          checked={isProgramUser}
          onChange={() => setIsProgramUser(true)}
        />
      </CheckboxWrapper>
      <ButtonRow>
        <JoinBtn
          type="button"
          onClick={handleJoin}
          disabled={!userSettings?.username}
        >
          Join
        </JoinBtn>
      </ButtonRow>
    </CardContainer>
  );
};
