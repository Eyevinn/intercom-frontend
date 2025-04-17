import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TBasicProductionResponse } from "../../api/api";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UsersIcon,
} from "../../assets/icons/icon";
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
  Id,
  InnerDiv,
  Lineblock,
  ParticipantCount,
  ParticipantCountWrapper,
  ProductionItemWrapper,
  ProductionLines,
  ProductionName,
  SpinnerWrapper,
} from "./production-list-components";
import { LineBlock } from "./line-block";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";

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

  const [selectedLine, setSelectedLine] = useState<TLine | null>();
  const [lineRemoveId, setLineRemoveId] = useState<string>("");

  const { initiateProductionCall } = useInitiateProductionCall({
    dispatch,
  });

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

  const goToProduction = async (lineId: string) => {
    if (userSettings?.username) {
      const payload = {
        productionId: production.productionId,
        lineId,
        username: userSettings.username,
        audioinput: userSettings?.audioinput,
        lineUsedForProgramOutput:
          getLineByLineId(lineId)?.programOutputLine || false,
        isProgramUser,
      };

      const callPayload = {
        joinProductionOptions: payload,
        audiooutput: userSettings?.audiooutput,
      };

      const success = await initiateProductionCall({ payload: callPayload });

      if (success) {
        navigate(
          `/production-calls/production/${payload.productionId}/line/${lineId}`
        );
      }
    }
  };

  return (
    <ProductionItemWrapper>
      <HeaderWrapper onClick={() => setOpen(!open)}>
        <HeaderTexts
          open={open}
          isProgramOutputLine={false}
          className={totalParticipants > 0 ? "active" : ""}
        >
          <ProductionName title={production.name}>
            {production.name.length > 40
              ? `${production.name.slice(0, 40)}...`
              : production.name}
            <Id>{`(id: ${production?.productionId})`}</Id>
          </ProductionName>
          <ParticipantCountWrapper>
            <UsersIcon />
            <ParticipantCount>{totalParticipants}</ParticipantCount>
          </ParticipantCountWrapper>
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
              <LineBlock
                managementMode={managementMode}
                line={l}
                production={production}
              />
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
