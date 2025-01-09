import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TBasicProductionResponse } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PersonIcon,
  UsersIcon,
} from "../../assets/icons/icon";
import {
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "../manage-productions/use-remove-production-line";
import {
  DeleteButton,
  HeaderIcon,
  HeaderTexts,
  HeaderWrapper,
  InnerDiv,
  Lineblock,
  LineBlockParticipant,
  LineBlockParticipants,
  LineBlockTexts,
  LineBlockTitle,
  ParticipantCount,
  PersonText,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
  SpinnerWrapper,
} from "./production-list-components";
import { ManageProductionButtons } from "./manage-production-buttons";

type ProductionsListItemProps = {
  production: TBasicProductionResponse;
  managementMode?: boolean;
};

export const ProductionsListItem = ({
  production,
  managementMode = false,
}: ProductionsListItemProps) => {
  const [{ userSettings }, dispatch] = useGlobalState();
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(false);
  const [lineRemoveId, setLineRemoveId] = useState<string>("");

  const {
    loading: deleteLineLoading,
    successfullDelete: successfullDeleteLine,
    error: lineDeleteError,
  } = useRemoveProductionLine(
    parseInt(production.productionId, 10),
    parseInt(lineRemoveId, 10)
  );

  useEffect(() => {
    if (successfullDeleteLine) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
    setLineRemoveId("");
  }, [successfullDeleteLine, dispatch]);

  const totalParticipants = useMemo(() => {
    return (
      production.lines
        ?.map((line) => line.participants.length || 0)
        .reduce((partialSum, a) => partialSum + a, 0) || 0
    );
  }, [production]);

  const goToProduction = (lineId: string) => {
    if (userSettings?.username) {
      const payload = {
        productionId: production.productionId,
        lineId,
        username: userSettings.username,
        audioinput: userSettings?.audioinput,
        audiooutput: userSettings?.audiooutput,
      };

      const uuid = globalThis.crypto.randomUUID();

      dispatch({
        type: "ADD_CALL",
        payload: {
          id: uuid,
          callState: {
            joinProductionOptions: payload,
            mediaStreamInput: null,
            dominantSpeaker: null,
            audioLevelAboveThreshold: false,
            connectionState: null,
            audioElements: null,
            sessionId: null,
            hotkeys: {
              muteHotkey: "m",
              speakerHotkey: "n",
              pushToTalkHotkey: "t",
              increaseVolumeHotkey: "u",
              decreaseVolumeHotkey: "d",
              globalMuteHotkey: "p",
            },
          },
        },
      });
      dispatch({
        type: "SELECT_PRODUCTION_ID",
        payload: payload.productionId,
      });
      navigate(
        `/production-calls/production/${payload.productionId}/line/${lineId}`
      );
    }
  };

  return (
    <ProductionItemWrapper>
      <HeaderWrapper onClick={() => setOpen(!open)}>
        <HeaderTexts className={totalParticipants > 0 ? "active" : ""}>
          <ProductionName>{production.name}</ProductionName>
          <UsersIcon />
          <ParticipantCount>{totalParticipants}</ParticipantCount>
        </HeaderTexts>
        <HeaderIcon>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HeaderIcon>
      </HeaderWrapper>
      <ProductionLines className={open ? "expanded" : ""}>
        <InnerDiv>
          {production.lines?.map((l) => (
            <Lineblock key={`line-${l.id}-${l.name}`}>
              <LineBlockTexts>
                <LineBlockTitle>{l.name}</LineBlockTitle>
                <LineBlockParticipants>
                  {l.participants.map((participant) => (
                    <LineBlockParticipant
                      key={`participant-${participant.sessionId}`}
                    >
                      <PersonIcon />
                      <PersonText>{participant.name}</PersonText>
                    </LineBlockParticipant>
                  ))}
                </LineBlockParticipants>
              </LineBlockTexts>
              {managementMode ? (
                <DeleteButton
                  type="button"
                  disabled={!!l.participants.length}
                  onClick={() => setLineRemoveId(l.id)}
                >
                  Delete
                  {deleteLineLoading && (
                    <SpinnerWrapper>
                      <Spinner className="production-list" />
                    </SpinnerWrapper>
                  )}
                </DeleteButton>
              ) : (
                <SecondaryButton
                  type="button"
                  onClick={() => goToProduction(l.id)}
                >
                  Join
                </SecondaryButton>
              )}
            </Lineblock>
          ))}
          {lineDeleteError && (
            <StyledWarningMessage className="error-message production-list">
              {lineDeleteError.message}
            </StyledWarningMessage>
          )}
          {managementMode && (
            <ManageProductionButtons
              productionId={production.productionId}
              isDeleteProductionDisabled={totalParticipants > 0}
            />
          )}
        </InnerDiv>
      </ProductionLines>
    </ProductionItemWrapper>
  );
};
