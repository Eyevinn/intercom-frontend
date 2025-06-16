import { useEffect, useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormInput, FormLabel } from "../form-elements/form-elements";
import { EditNameWrapper, NameEditButton } from "./shared-components";
import { SaveIcon, EditIcon } from "../../assets/icons/icon";
import { Spinner } from "../loader/loader";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { useEditLineName } from "../manage-productions-page/use-edit-line-name";
import { useEditProductionName } from "../manage-productions-page/use-edit-production-name";
import { useGlobalState } from "../../global-state/context-provider";
import { useOutsideClickHandler } from "../../hooks/use-outside-click-handler";
import { TLine } from "../production-line/types";

type FormValues = {
  productionName: string;
  [key: `lineName-${string}`]: string;
  ingestName: string;
  deviceOutputLabel: string;
  deviceInputLabel: string;
  currentDeviceLabel: string;
};

type BaseItem = {
  name: string;
};

type ProductionItem = BaseItem & {
  productionId: string;
  lines?: TLine[];
};

type IngestItem = BaseItem & {
  id: string;
  name: string;
  deviceOutput: {
    name: string;
    label: string;
  }[];
  deviceInput: {
    name: string;
    label: string;
  }[];
  currentDeviceLabel?: string;
};

type EditableItem = ProductionItem | IngestItem;

type EditNameFormProps<T extends EditableItem> = {
  item: T;
  formSubmitType:
    | `lineName-${string}`
    | "productionName"
    | "ingestName"
    | "deviceOutputLabel"
    | "deviceInputLabel"
    | "currentDeviceLabel";
  managementMode: boolean;
  setEditNameOpen: (editNameOpen: boolean) => void;
  renderLabel: (
    item: T,
    line?: TLine,
    managementMode?: boolean
  ) => React.ReactNode;
  className?: string;
};

const isProduction = (item: EditableItem): item is ProductionItem => {
  return "productionId" in item;
};

export const EditNameForm = <T extends EditableItem>({
  item,
  formSubmitType,
  managementMode,
  setEditNameOpen,
  renderLabel,
  className,
}: EditNameFormProps<T>) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [savedItem, setSavedItem] = useState<T | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [editLineId, setEditLineId] = useState<{
    productionId: string;
    lineId: string;
    name: string;
  } | null>(null);
  const [editProductionId, setEditProductionId] = useState<{
    productionId: string;
    name: string;
  } | null>(null);

  const [, dispatch] = useGlobalState();

  const { loading: editProductionLoading, success: successfullEditProduction } =
    useEditProductionName(editProductionId);

  const { loading: editLineLoading, success: successfullEditLine } =
    useEditLineName(editLineId);

  useOutsideClickHandler(wrapperRef, () => {
    if (isEditingName) {
      setIsEditingName(false);
      setSavedItem(null);
    }
  });

  const lineIndex = parseInt(formSubmitType.toString().split("-")[1], 10);
  const line =
    isProduction(item) && item.lines ? item.lines[lineIndex] : undefined;

  const isCurrentLine = editLineId?.lineId === line?.id;

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const formValues = watch();
  const [productionName] = watch(["productionName"]);

  const hasLineChanges = () => {
    if (!savedItem || !isProduction(savedItem) || !savedItem.lines)
      return false;
    return savedItem.lines.some(
      (l, index) =>
        formValues[`lineName-${index}`] &&
        formValues[`lineName-${index}`] !== l.name
    );
  };

  const isUpdated = productionName !== savedItem?.name || hasLineChanges();

  useEffect(() => {
    if (!savedItem) return;

    if (
      (formSubmitType === "productionName" ||
        formSubmitType === "ingestName") &&
      savedItem.name
    ) {
      setValue(formSubmitType, savedItem.name);
    }
    if (
      savedItem &&
      formSubmitType === "currentDeviceLabel" &&
      "currentDeviceLabel" in savedItem
    ) {
      setValue(formSubmitType, savedItem.currentDeviceLabel || "");
    }
    if (savedItem && isProduction(savedItem) && savedItem.lines) {
      savedItem.lines.forEach((l, index) => {
        setValue(`lineName-${index}`, l.name);
      });
    }
  }, [savedItem, setValue, formSubmitType]);

  useEffect(() => {
    if (successfullEditLine || successfullEditProduction) {
      setEditLineId(null);
      setEditProductionId(null);
      setEditNameOpen?.(false);
      setIsEditingName(false);
      setSavedItem(null);
    }
    dispatch({
      type: "PRODUCTION_UPDATED",
    });
  }, [
    successfullEditLine,
    successfullEditProduction,
    setEditNameOpen,
    dispatch,
  ]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (
      data.productionName &&
      data.productionName !== "" &&
      data.productionName !== savedItem?.name &&
      savedItem?.name
    ) {
      const productionId = isProduction(savedItem)
        ? savedItem.productionId
        : savedItem.id;
      setEditProductionId({
        productionId,
        name: data.productionName,
      });
      return;
    }

    if (
      formSubmitType.startsWith("lineName-") &&
      savedItem &&
      isProduction(savedItem)
    ) {
      const currentLineIndex = parseInt(
        formSubmitType.toString().split("-")[1],
        10
      );
      const currentLine = savedItem.lines?.[currentLineIndex];
      const newName = data[`lineName-${currentLineIndex}`];

      if (currentLine && newName !== "" && currentLine.name !== newName) {
        setEditLineId({
          productionId: savedItem.productionId,
          lineId: currentLine.id,
          name: newName,
        });
      }
    }

    setSavedItem(null);
    setIsEditingName(false);
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: isUpdated,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isEditingName) {
      handleSubmit(onSubmit)();
    } else {
      setSavedItem(item);
      setIsEditingName(true);
    }
  };

  const saveButton =
    (formSubmitType === "productionName" && editProductionLoading) ||
    (formSubmitType !== "productionName" &&
      editLineLoading &&
      isCurrentLine) ? (
      <Spinner
        className={`name-edit-button ${formSubmitType === "productionName" ? "production-name" : ""}`}
      />
    ) : (
      <SaveIcon />
    );

  return (
    <EditNameWrapper ref={wrapperRef}>
      <EditNameWrapper>
        {!isEditingName && renderLabel(item, line, managementMode)}
        {isEditingName && (
          <FormLabel className="save-edit">
            <FormInput
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register(formSubmitType)}
              placeholder="New Name"
              className={`name-edit-button edit-name ${className}`}
              autoComplete="off"
            />
          </FormLabel>
        )}
      </EditNameWrapper>
      {managementMode && (
        <NameEditButton
          type="button"
          className="name-edit-button"
          onClick={handleClick}
        >
          {isEditingName ? saveButton : <EditIcon />}
        </NameEditButton>
      )}
    </EditNameWrapper>
  );
};
