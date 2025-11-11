import { useMemo, useState, useEffect } from "react";
import { TSavedReceiver, TBridgeState } from "../../api/api";
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
import { useToggleReceiver } from "../../hooks/use-edit-receiver";
import { useUpdateReceiver } from "../../hooks/use-update-receiver";
import { FormInput, FormSelect } from "../form-elements/form-elements";
import { TLine } from "../production-line/types";

type ReceiverExpandedContentProps = {
  receiver: TSavedReceiver;
  displayConfirmationModal: boolean;
  deleteReceiverLoading: boolean;
  setDisplayConfirmationModal: (displayConfirmationModal: boolean) => void;
  setRemoveReceiverId: (receiverId: string | null) => void;
  refresh?: () => void;
};

export const ReceiverExpandedContent = ({
  receiver,
  displayConfirmationModal,
  deleteReceiverLoading,
  setDisplayConfirmationModal,
  setRemoveReceiverId,
  refresh,
}: ReceiverExpandedContentProps) => {
  const [showAllParameters, setShowAllParameters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLabel, setEditLabel] = useState(receiver.label || "");
  const [editProductionId, setEditProductionId] = useState(
    receiver.productionId
  );
  const [editLineId, setEditLineId] = useState(receiver.lineId);

  const isDeleteReceiverDisabled = receiver.status === "running";

  const { toggle, loading: editReceiverLoading } = useToggleReceiver(
    // eslint-disable-next-line no-underscore-dangle
    receiver._id
  );
  const { updateReceiver, loading: updateLoading } = useUpdateReceiver();
  const { productions } = useFetchProductionList({ extended: "true" });

  const productionIdNum = receiver.productionId || null;
  const lineIdStr = receiver.lineId?.toString() || "";

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
      setEditLabel(receiver.label || "");
      setEditProductionId(receiver.productionId);
      setEditLineId(receiver.lineId);
    }
  }, [receiver, isEditMode]);

  const handleSave = async () => {
    // eslint-disable-next-line no-underscore-dangle
    const updated = await updateReceiver({
      id: receiver._id,
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
    setEditLabel(receiver.label || "");
    setEditProductionId(receiver.productionId);
    setEditLineId(receiver.lineId);
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
                    <BoldText>Label:</BoldText> {receiver.label || "N/A"}
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
                  title="Edit receiver"
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
                <span style={{ fontWeight: "bold" }}>ID:</span> {receiver._id}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Label:</span>{" "}
                {receiver.label || "N/A"}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Production ID:</span>{" "}
                {receiver.productionId}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Line ID:</span>{" "}
                {receiver.lineId}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>WHEP URL:</span>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {receiver.whepUrl}
                </span>
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>SRT URL:</span>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {receiver.srtUrl}
                </span>
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Status:</span>{" "}
                {receiver.status}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Created:</span>{" "}
                {receiver.createdAt
                  ? new Date(receiver.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div style={{ marginBottom: "3px" }}>
                <span style={{ fontWeight: "bold" }}>Updated:</span>{" "}
                {receiver.updatedAt
                  ? new Date(receiver.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>
          )}
        </TextWrapper>
      </ContentWrapper>
      <ButtonsWrapper>
        <StateChangeButton
          onClick={() => toggle(receiver.status as TBridgeState)}
          disabled={editReceiverLoading}
          type="button"
          bgColor={renderStateChangeButtonColor(
            receiver.status as TBridgeState
          )}
        >
          {renderButtonContent(receiver.status as TBridgeState)}
        </StateChangeButton>
        <DeleteButton
          type="button"
          disabled={isDeleteReceiverDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          Delete Receiver
          {deleteReceiverLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
      {displayConfirmationModal && (
        <ConfirmationModal
          title="Delete Receiver"
          // eslint-disable-next-line no-underscore-dangle
          description={`You are about to delete the receiver ${receiver.label ?? `with ID ${receiver._id}`}`}
          confirmationText="Are you sure?"
          onCancel={() => setDisplayConfirmationModal(false)}
          // eslint-disable-next-line no-underscore-dangle
          onConfirm={() => setRemoveReceiverId(receiver._id)}
        />
      )}
    </>
  );
};
