import { useMemo, useState, useEffect } from "react";
import { TSavedTransmitter, TBridgeState } from "../../api/api";
import {
  ButtonsWrapper,
  DeleteButton,
  SpinnerWrapper,
} from "../delete-button/delete-button-components";
import { Spinner } from "../loader/loader";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { useFetchProduction } from "../landing-page/use-fetch-production";
import { useFetchProductionList } from "../landing-page/use-fetch-production-list";
import {
  BoldText,
  ButtonContentWrapper,
  ContentWrapper,
  IconWrapper,
  StateChangeButton,
  TextWrapper,
} from "./io-bridge-components";
import {
  StopIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  SaveIcon,
} from "../../assets/icons/icon";
import { useToggleTransmitter } from "../../hooks/use-edit-transmitter";
import { useUpdateTransmitter } from "../../hooks/use-update-transmitter";
import { FormInput, FormSelect } from "../form-elements/form-elements";
import { TLine } from "../production-line/types";

type ExpandedContentProps = {
  transmitter: TSavedTransmitter;
  displayConfirmationModal: boolean;
  deleteTransmitterLoading: boolean;
  setDisplayConfirmationModal: (displayConfirmationModal: boolean) => void;
  setRemoveTransmitterId: (transmitterId: string | null) => void;
  refresh?: () => void;
};

export const ExpandedContent = ({
  transmitter,
  displayConfirmationModal,
  deleteTransmitterLoading,
  setDisplayConfirmationModal,
  setRemoveTransmitterId,
  refresh,
}: ExpandedContentProps) => {
  const [showAllParameters, setShowAllParameters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLabel, setEditLabel] = useState(transmitter.label || "");
  const [editProductionId, setEditProductionId] = useState(
    transmitter.productionId
  );
  const [editLineId, setEditLineId] = useState(transmitter.lineId);

  const isDeleteTransmitterDisabled = transmitter.status === "running";

  const { toggle, loading: editTransmitterLoading } = useToggleTransmitter(
    transmitter._id
  );
  const { updateTransmitter, loading: updateLoading } = useUpdateTransmitter();
  const { productions } = useFetchProductionList({ extended: "true" });

  const productionIdNum = transmitter.productionId || null;
  const lineIdStr = transmitter.lineId?.toString() || "";

  const { production } = useFetchProduction(productionIdNum);

  const line = useMemo(
    () =>
      production && lineIdStr
        ? production.lines.find((l) => l.id === lineIdStr)
        : undefined,
    [production, lineIdStr]
  );

  const selectedProduction = useMemo(() => {
    const list = productions?.productions ?? [];
    return list.find(
      (p) => String(p.productionId) === String(editProductionId)
    );
  }, [productions, editProductionId]);

  const availableLines = selectedProduction?.lines || [];

  useEffect(() => {
    // Only update edit values when not in edit mode to prevent polling from overwriting user changes
    if (!isEditMode) {
      setEditLabel(transmitter.label || "");
      setEditProductionId(transmitter.productionId);
      setEditLineId(transmitter.lineId);
    }
  }, [transmitter, isEditMode]);

  const handleSave = async () => {
    const updated = await updateTransmitter({
      id: transmitter._id,
      label: editLabel,
      productionId: editProductionId,
      lineId: editLineId,
    });

    if (updated) {
      setIsEditMode(false);
      if (refresh) {
        refresh();
      }
    }
  };

  const handleCancel = () => {
    setEditLabel(transmitter.label || "");
    setEditProductionId(transmitter.productionId);
    setEditLineId(transmitter.lineId);
    setIsEditMode(false);
  };

  const renderStateChangeButtonColor = (status: TBridgeState) => {
    switch (status) {
      case "running":
        return "#f96c6c";
      case "failed":
        return "#ebca6a";
      case "stopped":
        return "#22c55e";
      case "idle":
        return "#22c55e";
      default:
        return "#59cbe8";
    }
  };

  const renderButtonContent = (status: TBridgeState) => {
    switch (status) {
      case "running":
        return (
          <ButtonContentWrapper>
            <IconWrapper>
              <StopIcon />
            </IconWrapper>
            <p>Stop</p>
          </ButtonContentWrapper>
        );
      default:
        return (
          <ButtonContentWrapper>
            <IconWrapper>
              <PlayIcon />
            </IconWrapper>
            <p>Run</p>
          </ButtonContentWrapper>
        );
    }
  };

  return (
    <>
      <ContentWrapper style={{ width: "100%" }}>
        <TextWrapper style={{ width: "100%" }}>
          <div style={{ width: "100%", display: "block" }}>
            {isEditMode ? (
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <BoldText>Label:</BoldText>
                  <FormInput
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Label"
                    style={{ marginTop: "4px", width: "100%" }}
                  />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <BoldText>Production:</BoldText>
                  <FormSelect
                    value={String(editProductionId)}
                    onChange={(e) => {
                      const newProdId = Number(e.target.value);
                      setEditProductionId(newProdId);
                      const newProd = productions?.productions?.find(
                        (p) => String(p.productionId) === e.target.value
                      );
                      if (newProd?.lines?.[0]) {
                        setEditLineId(Number(newProd.lines[0].id));
                      }
                    }}
                    style={{ marginTop: "4px", width: "100%" }}
                  >
                    {productions?.productions?.map((p) => (
                      <option
                        key={p.productionId}
                        value={String(p.productionId)}
                      >
                        {p.name}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <BoldText>Line:</BoldText>
                  <FormSelect
                    value={String(editLineId)}
                    onChange={(e) => setEditLineId(Number(e.target.value))}
                    style={{ marginTop: "4px", width: "100%" }}
                  >
                    {availableLines.map((line: TLine) => (
                      <option key={String(line.id)} value={String(line.id)}>
                        {line.name}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updateLoading}
                    style={{
                      background: "#22c55e",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 8px",
                      color: "white",
                      cursor: updateLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {updateLoading ? (
                        <Spinner className="production-list" />
                      ) : (
                        <SaveIcon />
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      background: "#f96c6c",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 8px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <div>
                  <ContentWrapper>
                    <BoldText>Label:</BoldText> {transmitter.label || "N/A"}
                  </ContentWrapper>
                  <ContentWrapper>
                    <BoldText>Production:</BoldText> {production?.name}
                  </ContentWrapper>
                  <ContentWrapper>
                    <BoldText>Line:</BoldText> {line?.name}
                  </ContentWrapper>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  style={{
                    background: "#59cbe8",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 8px",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "12px",
                  }}
                  title="Edit transmitter"
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <EditIcon />
                  </span>
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: "12px", width: "100%" }}>
            <button
              type="button"
              onClick={() => setShowAllParameters(!showAllParameters)}
              style={{
                background: "none",
                border: "none",
                color: "#59cbe8",
                cursor: "pointer",
                padding: "4px 0",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                width: "100%",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showAllParameters ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </span>
              {showAllParameters ? "Hide" : "Show more"}
            </button>
          </div>
          {showAllParameters && (
            <div
              style={{ marginTop: "8px", fontSize: "12px", lineHeight: "1.6" }}
            >
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>ID:</span>{" "}
                {transmitter._id}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Label:</span>{" "}
                {transmitter.label || "N/A"}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Port:</span>{" "}
                {transmitter.port}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Production ID:</span>{" "}
                {transmitter.productionId}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Line ID:</span>{" "}
                {transmitter.lineId}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>WHIP URL:</span>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {transmitter.whipUrl}
                </span>
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>SRT URL:</span>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {transmitter.srtUrl || "N/A"}
                </span>
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Pass-through URL:</span>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {transmitter.passThroughUrl || "N/A"}
                </span>
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Mode:</span>{" "}
                {transmitter.mode}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Status:</span>{" "}
                {transmitter.status}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Created:</span>{" "}
                {transmitter.createdAt
                  ? new Date(transmitter.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Updated:</span>{" "}
                {transmitter.updatedAt
                  ? new Date(transmitter.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>
          )}
        </TextWrapper>
      </ContentWrapper>
      <ButtonsWrapper>
        <StateChangeButton
          onClick={toggle}
          disabled={editTransmitterLoading}
          type="button"
          bgColor={renderStateChangeButtonColor(
            transmitter.status as TBridgeState
          )}
        >
          {renderButtonContent(transmitter.status as TBridgeState)}
        </StateChangeButton>
        <DeleteButton
          type="button"
          disabled={isDeleteTransmitterDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          Delete Transmitter
          {deleteTransmitterLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
      {displayConfirmationModal && (
        <ConfirmationModal
          title="Delete Transmitter"
          description={`You are about to delete the transmitter ${transmitter.label ?? `running at port ${transmitter.port}`}`}
          confirmationText="Are you sure?"
          onCancel={() => setDisplayConfirmationModal(false)}
          onConfirm={() => setRemoveTransmitterId(transmitter._id)}
        />
      )}
    </>
  );
};
