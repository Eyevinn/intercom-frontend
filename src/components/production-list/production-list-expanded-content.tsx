import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { TBasicProductionResponse, TPreset } from "../../api/api";
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
import { buildCallsUrl } from "../../utils/call-url";
import { usePresetContext } from "../../contexts/preset-context";

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

  const navigate = useNavigate();

  const [selectedLine, setSelectedLine] = useState<TLine | null>();
  const [lineRemoveId, setLineRemoveId] = useState<string>("");
  const affectedPresetsRef = useRef<TPreset[]>([]);

  const { presets, updatePreset } = usePresetContext();

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
    if (!successfullDeleteLine) return;

    const toUpdate = affectedPresetsRef.current;
    const deletedLineId = lineRemoveId;
    if (toUpdate.length > 0) {
      Promise.all(
        toUpdate.map((preset) => {
          const updatedCalls = preset.calls.filter(
            (c) =>
              !(
                c.productionId === production.productionId &&
                c.lineId === deletedLineId
              )
          );
          // eslint-disable-next-line no-underscore-dangle
          return updatePreset(preset._id, { calls: updatedCalls });
        })
      )
        .then(() => dispatch({ type: "PRESET_UPDATED" }))
        .catch(() => {});
      affectedPresetsRef.current = [];
    }

    setLineRemoveId("");
    setSelectedLine(null);
  }, [
    successfullDeleteLine,
    lineRemoveId,
    production.productionId,
    dispatch,
    updatePreset,
  ]);

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
        isProgramUser: false,
      };

      const callPayload = {
        joinProductionOptions: payload,
        audiooutput: userSettings?.audiooutput,
      };

      const success = await initiateProductionCall({ payload: callPayload });

      if (success) {
        navigate(
          buildCallsUrl([{ productionId: payload.productionId, lineId }])
        );
      }
    }
  };

  const affectedPresets = selectedLine
    ? presets.filter((g) =>
        g.calls.some(
          (c) =>
            c.productionId === production.productionId &&
            c.lineId === selectedLine.id
        )
      )
    : [];

  const confirmationText =
    affectedPresets.length > 0
      ? `This line is in ${affectedPresets.length} saved configuration${affectedPresets.length > 1 ? "s" : ""}: ${affectedPresets.map((g) => g.name).join(", ")}. It will be removed from ${affectedPresets.length > 1 ? "those saved configurations" : "that saved configuration"}.`
      : undefined;

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
                  navigate(
                    buildCallsUrl([
                      {
                        productionId: production.productionId,
                        lineId: l.id,
                      },
                    ])
                  );
                } else {
                  goToProduction(l.id);
                }
              }}
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
          production={production}
          isDeleteProductionDisabled={totalParticipants > 0}
        />
      )}
      {selectedLine && (
        <ConfirmationModal
          title="Delete Line"
          description={`You are about to delete the line: ${selectedLine.name}. Are you sure?`}
          confirmationText={confirmationText}
          onCancel={() => setSelectedLine(null)}
          onConfirm={() => {
            if (!selectedLine?.id) return;
            affectedPresetsRef.current = affectedPresets;
            setLineRemoveId(selectedLine.id);
          }}
        />
      )}
    </>
  );
};
