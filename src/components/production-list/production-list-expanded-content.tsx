import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TBasicProductionResponse } from "../../api/api";
import { AudioFeedModal } from "../audio-feed-modal/audio-feed-modal";
import {
  DeleteButton,
  SpinnerWrapper,
} from "../delete-button/delete-button-components";
import {
  SecondaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { Spinner } from "../loader/loader";
import { EditNameForm } from "../shared/edit-name-form";
import { LabelField } from "./labelField";
import { ManageProductionButtons } from "./manage-production-buttons";
import { Lineblock } from "./production-list-components";
import { useRemoveProductionLine } from "../manage-productions-page/use-remove-production-line";
import { useGlobalState } from "../../global-state/context-provider";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { TLine } from "../production-line/types";

type ExpandedContentProps = {
  production: TBasicProductionResponse;
  managementMode: boolean;
  totalParticipants: number;
};

export const ProductionListExpandedContent = ({
  production,
  managementMode,
  totalParticipants,
}: ExpandedContentProps) => {
  const [editNameOpen, setEditNameOpen] = useState<boolean>(false);
  const [{ userSettings }, dispatch] = useGlobalState();
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
  }, [successfullDeleteLine, dispatch]);

  useEffect(() => {
    if (successfullDeleteLine) {
      setLineRemoveId("");
      setSelectedLine(null);
    }
  }, [successfullDeleteLine]);

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
    <>
      {production.lines?.map((l, index) => (
        <Lineblock
          key={`line-${l.id}-${l.name}`}
          isProgramOutput={l.programOutputLine}
          className={editNameOpen ? "edit-name-open" : ""}
        >
          <EditNameForm
            item={production}
            formSubmitType={`lineName-${index.toString()}`}
            managementMode={managementMode}
            setEditNameOpen={setEditNameOpen}
            renderLabel={(item, line, mode) => (
              <LabelField
                isLabelProductionName={false}
                production={item as TBasicProductionResponse}
                line={line ?? ({} as TLine)}
                managementMode={mode ?? false}
              />
            )}
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
      {selectedLine && (
        <ConfirmationModal
          title="Delete Line"
          description={`You are about to delete the line: ${selectedLine.name}. Are you sure?`}
          onCancel={() => setSelectedLine(null)}
          onConfirm={() =>
            selectedLine?.id ? setLineRemoveId(selectedLine.id) : null
          }
        />
      )}
    </>
  );
};
