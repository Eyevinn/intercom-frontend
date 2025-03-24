import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TBasicProductionResponse } from "../../api/api";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TVIcon,
  UserIcon,
  UsersIcon,
} from "../../assets/icons/icon";
import { isMobile } from "../../bowser";
import { useGlobalState } from "../../global-state/context-provider";
import { AudioFeedModal } from "../audio-feed-modal/audio-feed-modal";
import {
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "../manage-productions-page/use-remove-production-line";
import { TLine } from "../production-line/types";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { ManageProductionButtons } from "./manage-production-buttons";
import {
  DeleteButton,
  HeaderIcon,
  HeaderTexts,
  HeaderWrapper,
  IconWrapper,
  Id,
  InnerDiv,
  Lineblock,
  LineBlockParticipant,
  LineBlockParticipants,
  LineBlockTexts,
  LineBlockTitle,
  LineBlockTitleWrapper,
  ParticipantCount,
  ParticipantExpandBtn,
  PersonText,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
  SpinnerWrapper,
} from "./production-list-components";

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

  const [showFullUserList, setShowFullUserList] = useState<boolean>(false);
  const [selectedLine, setSelectedLine] = useState<TLine | null>();
  const [lineRemoveId, setLineRemoveId] = useState<string>("");

  const {
    loading: deleteLineLoading,
    successfullDelete: successfullDeleteLine,
    error: lineDeleteError,
  } = useRemoveProductionLine(production.productionId, lineRemoveId);

  useEffect(() => {
    if (successfullDeleteLine) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
    setLineRemoveId("");
    setSelectedLine(null);
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
        <HeaderTexts
          open={open}
          className={totalParticipants > 0 ? "active" : ""}
        >
          <ProductionName title={production.name}>
            {production.name.length > 40
              ? `${production.name.slice(0, 40)}...`
              : production.name}
            <Id>{`(id: ${production?.productionId})`}</Id>
          </ProductionName>
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
            <Lineblock
              key={`line-${l.id}-${l.name}`}
              isProgramOutput={l.programOutputLine}
            >
              <LineBlockTexts>
                <LineBlockTitleWrapper>
                  {l.programOutputLine && (
                    <IconWrapper>
                      <TVIcon />
                    </IconWrapper>
                  )}
                  <LineBlockTitle title={l.name}>
                    {l.name.length > 40 ? `${l.name.slice(0, 40)}...` : l.name}
                  </LineBlockTitle>
                  {l.participants.length > 4 && (
                    <ParticipantExpandBtn
                      type="button"
                      title={showFullUserList ? "Hide users" : "Show all users"}
                      onClick={() => setShowFullUserList(!showFullUserList)}
                    >
                      <PersonText>
                        {showFullUserList ? "hide" : "show"}{" "}
                        {isMobile ? "" : "full list"}
                      </PersonText>
                      {showFullUserList ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </ParticipantExpandBtn>
                  )}
                </LineBlockTitleWrapper>
                <LineBlockParticipants>
                  {(showFullUserList
                    ? l.participants
                    : l.participants.slice(0, 4)
                  ).map((participant) => (
                    <LineBlockParticipant
                      key={`participant-${participant.sessionId}`}
                    >
                      <UserIcon />
                      <PersonText>{participant.name}</PersonText>
                    </LineBlockParticipant>
                  ))}
                  {l.participants.length > 4 && !showFullUserList && (
                    <LineBlockParticipant>
                      <UsersIcon />
                      <PersonText>{`+${l.participants.length - 4} other user${l.participants.length - 4 > 1 ? "s" : ""}`}</PersonText>
                    </LineBlockParticipant>
                  )}
                </LineBlockParticipants>
              </LineBlockTexts>
              {managementMode ? (
                <DeleteButton
                  type="button"
                  disabled={!!l.participants.length}
                  onClick={() => setSelectedLine(l)}
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
                <AudioFeedModal
                  onClose={() => setIsModalOpen(false)}
                  onJoin={() => {
                    setIsModalOpen(false);
                    goToProduction(modalLineId);
                  }}
                  setIsProgramUser={setIsProgramUser}
                  isProgramUser={isProgramUser}
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
              production={production}
              isDeleteProductionDisabled={totalParticipants > 0}
            />
          )}
        </InnerDiv>
      </ProductionLines>
      {selectedLine && (
        <ConfirmationModal
          title="Delete Line"
          description={`You are about to delete the line: ${selectedLine.name}. Are you sure?`}
          onCancel={() => setSelectedLine(null)}
          onConfirm={() => setLineRemoveId(selectedLine.id)}
        />
      )}
    </ProductionItemWrapper>
  );
};
