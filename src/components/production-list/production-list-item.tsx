import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TBasicProductionResponse } from "../../api/api";
import { useGlobalState } from "../../global-state/context-provider";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  RemoveIcon,
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
import { ProgramOutputModal } from "../program-output-modal/program-output-modal";
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
  const [open, setOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLineId, setModalLineId] = useState<string | null>(null);
  const [isProgramUser, setIsProgramUser] = useState<boolean>(false);
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

  const getLineByLineId = (lineId: string) => {
    return production.lines?.find((l) => l.id === lineId);
  };

  const goToProduction = (lineId: string) => {
    if (userSettings?.username) {
      const payload = {
        productionId: production.productionId,
        lineId,
        username: userSettings.username,
        audioinput: userSettings?.audioinput,
        audiooutput: userSettings?.audiooutput,
        lineUsedForProgramOutput:
          getLineByLineId(lineId)?.programOutputLine || false,
        isProgramUser,
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
            dataChannel: null,
            isRemotelyMuted: false,
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
                      <UserIcon />
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
                  onClick={() => {
                    if (l.programOutputLine) {
                      setModalLineId(l.id);
                      setIsModalOpen(true);
                    } else {
                      goToProduction(l.id);
                    }
                  }}
                >
                  Join
                </SecondaryButton>
              )}
              {isModalOpen && modalLineId && (
                <ProgramOutputModal
                  onClose={() => setIsModalOpen(false)}
                  onJoin={() => {
                    setIsModalOpen(false);
                    goToProduction(modalLineId);
                  }}
                  setIsProgramUser={setIsProgramUser}
                />
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
