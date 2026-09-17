import { ReactNode, useState } from "react";
import { TBasicProductionResponse } from "../../api/api";
import {
  CheckIcon,
  ChevronUpIcon,
  CopyIcon,
  EditIcon,
} from "../../assets/icons/icon";
import { useCopyLinks } from "../copy-button/use-copy-links";
import { FormInput, FormSelect } from "../form-elements/form-elements";
import { TLine } from "../production-line/types";
import {
  EditableValue,
  IconEditButton,
  InlineCopyButton,
  InlineToggleButton,
  PropKey,
  PropsCard,
  PropValue,
} from "./io-bridge-components";

const TRUNCATE_LENGTH = 15;

export const TruncatedValue = ({ text }: { text?: string }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <PropValue>N/A</PropValue>;

  if (text.length <= TRUNCATE_LENGTH) {
    return <PropValue>{text}</PropValue>;
  }

  return (
    <EditableValue>
      {expanded ? text : `${text.slice(0, TRUNCATE_LENGTH)}...`}
      <InlineToggleButton
        type="button"
        onClick={() => setExpanded(!expanded)}
        title={expanded ? "Show less" : "Show more"}
      >
        {expanded ? <ChevronUpIcon /> : "Show more"}
      </InlineToggleButton>
    </EditableValue>
  );
};

export type TEditableField = "label" | "production" | "line" | null;

export type IOBridgeItemBase = {
  _id: string;
  label?: string;
  productionId: number;
  lineId: number;
  status: string;
  srtUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UrlConfig = {
  label: string;
  url: string;
  copyLabel: string;
};

type IOBridgePropsListProps = {
  item: IOBridgeItemBase;
  editingField: TEditableField;
  productionName: string;
  lineName: string;
  productions: TBasicProductionResponse[];
  availableLines: TLine[];
  editLabel: string;
  editProductionId: number;
  editLineId: number;
  urlConfig: UrlConfig;
  extraRows?: ReactNode;
  setEditLabel: (label: string) => void;
  setEditProductionId: (id: number) => void;
  setEditLineId: (id: number) => void;
  setEditingField: (field: TEditableField) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const IOBridgePropsList = ({
  item,
  editingField,
  productionName,
  lineName,
  productions,
  availableLines,
  editLabel,
  editProductionId,
  editLineId,
  urlConfig,
  extraRows,
  setEditLabel,
  setEditProductionId,
  setEditLineId,
  onSave,
  onCancel,
  setEditingField,
}: IOBridgePropsListProps) => {
  const { isCopied, handleCopyUrlToClipboard } = useCopyLinks();

  const commit = () => {
    const labelChanged = editLabel !== (item.label || "");
    const productionChanged = editProductionId !== item.productionId;
    const lineChanged = editLineId !== item.lineId;
    if (labelChanged || productionChanged || lineChanged) {
      onSave();
    } else {
      onCancel();
    }
  };

  return (
    <PropsCard>
      <PropKey>ID:</PropKey>
      {/* eslint-disable-next-line no-underscore-dangle */}
      <PropValue>{item._id}</PropValue>

      <PropKey>Label:</PropKey>
      {editingField === "label" ? (
        <FormInput
          autoFocus
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="Label"
        />
      ) : (
        <EditableValue>
          {item.label || "N/A"}
          <IconEditButton
            type="button"
            onClick={() => setEditingField("label")}
            title="Edit label"
          >
            <EditIcon />
          </IconEditButton>
        </EditableValue>
      )}

      <PropKey>Production:</PropKey>
      {editingField === "production" ? (
        <FormSelect
          autoFocus
          value={String(editProductionId)}
          onChange={(e) => {
            const newProdId = Number(e.target.value);
            setEditProductionId(newProdId);
            const newProd = productions.find(
              (p) => String(p.productionId) === e.target.value
            );
            if (newProd?.lines?.[0]) {
              setEditLineId(Number(newProd.lines[0].id));
            }
          }}
          onBlur={commit}
        >
          {productions.map((p) => (
            <option key={p.productionId} value={String(p.productionId)}>
              {p.name}
            </option>
          ))}
        </FormSelect>
      ) : (
        <EditableValue>
          {productionName}
          <IconEditButton
            type="button"
            onClick={() => setEditingField("production")}
            title="Edit production"
          >
            <EditIcon />
          </IconEditButton>
        </EditableValue>
      )}

      <PropKey>Line:</PropKey>
      {editingField === "line" ? (
        <FormSelect
          autoFocus
          value={String(editLineId)}
          onChange={(e) => setEditLineId(Number(e.target.value))}
          onBlur={commit}
        >
          {availableLines.map((line) => (
            <option key={String(line.id)} value={String(line.id)}>
              {line.name}
            </option>
          ))}
        </FormSelect>
      ) : (
        <EditableValue>
          {lineName}
          <IconEditButton
            type="button"
            onClick={() => setEditingField("line")}
            title="Edit line"
          >
            <EditIcon />
          </IconEditButton>
        </EditableValue>
      )}

      <PropKey>Production ID:</PropKey>
      <PropValue>{item.productionId}</PropValue>

      <PropKey>Line ID:</PropKey>
      <PropValue>{item.lineId}</PropValue>

      <PropKey>{urlConfig.label}</PropKey>
      <EditableValue>
        {urlConfig.url.split("/").pop() || "N/A"}
        <InlineCopyButton
          type="button"
          copied={isCopied}
          onClick={() => handleCopyUrlToClipboard(urlConfig.url)}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? "Copied!" : urlConfig.copyLabel}
        </InlineCopyButton>
      </EditableValue>

      <PropKey>SRT URL:</PropKey>
      <TruncatedValue text={item.srtUrl} />

      {extraRows}

      <PropKey>Status:</PropKey>
      <PropValue>{item.status}</PropValue>

      <PropKey>Created:</PropKey>
      <PropValue>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
      </PropValue>

      <PropKey>Updated:</PropKey>
      <PropValue>
        {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}
      </PropValue>
    </PropsCard>
  );
};
