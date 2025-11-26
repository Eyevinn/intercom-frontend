import { useEffect, useMemo, useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  FormInput,
  FormLabel,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import {
  EditNameWrapper,
  NameEditButton,
  EditNameIconWrapper,
} from "./shared-components";
import { SaveIcon, EditIcon } from "../../assets/icons/icon";
import { Spinner } from "../loader/loader";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { useGlobalState } from "../../global-state/context-provider";
import { useOutsideClickHandler } from "../../hooks/use-outside-click-handler";
import { TLine } from "../production-line/types";
import { useEditActions } from "./use-edit-actions";
import { normalizeLineName } from "../../hooks/use-has-duplicate-line-name.ts";

type FormValues = {
  productionName: string;
  [key: `lineName-${string}`]: string;
};

type BaseItem = {
  name: string;
};

type ProductionItem = BaseItem & {
  productionId: string;
  lines?: TLine[];
};

type EditNameFormProps<T extends ProductionItem> = {
  item: T;
  formSubmitType: `lineName-${string}` | "productionName";
  managementMode: boolean;
  setEditNameOpen: (editNameOpen: boolean) => void;
  renderLabel: (
    item: T,
    line?: TLine,
    managementMode?: boolean
  ) => React.ReactNode;
  className?: string;
};

const isProduction = (item: ProductionItem): item is ProductionItem => {
  return "productionId" in item;
};

export const EditNameForm = <T extends ProductionItem>({
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

  const [, dispatch] = useGlobalState();

  const { editProductionName, editLineName, isLoading, isSuccess } =
    useEditActions();

  useOutsideClickHandler(wrapperRef, () => {
    if (isEditingName) {
      setIsEditingName(false);
      setSavedItem(null);
    }
  });

  const lineIndex = parseInt(formSubmitType.toString().split("-")[1], 10);
  const line =
    isProduction(item) && item.lines ? item.lines[lineIndex] : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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
        (formValues[`lineName-${index}`] ?? "").trim() !== l.name.trim()
    );
  };

  const normalizedProductionName = (productionName ?? "").trim();
  const originalProductionName = (savedItem?.name ?? "").trim();

  const isEditingProductionName = formSubmitType === "productionName";
  const hasValidationError = useMemo(
    () => formSubmitType.startsWith("lineName-") && errors[formSubmitType],
    [formSubmitType, errors]
  );
  const isUpdated =
    !!savedItem &&
    !hasValidationError &&
    (isEditingProductionName
      ? normalizedProductionName !== originalProductionName
      : hasLineChanges());

  useEffect(() => {
    if (!savedItem) return;

    if (
      formSubmitType === "productionName" &&
      "name" in savedItem &&
      savedItem.name
    ) {
      setValue(formSubmitType, savedItem.name);
    }

    if (savedItem && isProduction(savedItem) && savedItem.lines) {
      savedItem.lines.forEach((l, index) => {
        setValue(`lineName-${index}`, l.name);
      });
    }
  }, [savedItem, setValue, formSubmitType]);

  useEffect(() => {
    if (isSuccess) {
      setEditNameOpen?.(false);
      setIsEditingName(false);
      setSavedItem(null);
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [isSuccess, setEditNameOpen, dispatch]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (
      savedItem &&
      "name" in savedItem &&
      data.productionName &&
      data.productionName !== "" &&
      data.productionName !== savedItem.name
    ) {
      editProductionName(savedItem.productionId, data.productionName);
      return;
    }

    if (
      savedItem &&
      formSubmitType.startsWith("lineName-") &&
      isProduction(savedItem)
    ) {
      const currentLineIndex = lineIndex;
      const currentLine = savedItem.lines?.[currentLineIndex];
      const newName = data[`lineName-${currentLineIndex}`];

      if (currentLine && newName !== "" && currentLine.name !== newName) {
        editLineName(savedItem.productionId, currentLine.id, newName);
        return;
      }
    }

    setSavedItem(null);
    setIsEditingName(false);
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: isEditingName,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isEditingName) {
      if (!isUpdated) {
        setSavedItem(null);
        setIsEditingName(false);
        return;
      }

      handleSubmit(onSubmit)();
    } else {
      if (formSubmitType === "productionName" && "name" in item && item.name) {
        setValue(formSubmitType, item.name);
      }
      if (isProduction(item) && item.lines) {
        item.lines.forEach((l, index) => {
          setValue(`lineName-${index}`, l.name);
        });
      }
      setSavedItem(item);
      setIsEditingName(true);
    }
  };

  const validateLineName = (value: string) => {
    if (
      !value ||
      !formSubmitType.startsWith("lineName-") ||
      !savedItem ||
      !isProduction(savedItem) ||
      !savedItem.lines
    ) {
      return true;
    }

    const currentLineIndex = lineIndex;
    const normalized = normalizeLineName(value);
    const hasDuplicate = savedItem.lines.some(
      (l, index) =>
        index !== currentLineIndex && normalizeLineName(l.name) === normalized
    );

    if (hasDuplicate) {
      return "Line name must be unique within this production";
    }
    return true;
  };

  const saveButton = isLoading(formSubmitType, line?.id) ? (
    <Spinner
      className={`name-edit-button ${formSubmitType === "productionName" ? "production-name" : ""}`}
    />
  ) : (
    <SaveIcon />
  );

  const editButton = (
    <EditNameIconWrapper>
      <EditIcon />
    </EditNameIconWrapper>
  );

  return (
    <EditNameWrapper ref={wrapperRef}>
      {!isEditingName && renderLabel(item, line, managementMode)}
      {isEditingName && (
        <FormLabel className="save-edit">
          <FormInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register(formSubmitType, {
              validate: validateLineName,
            })}
            placeholder="New Name"
            className={`name-edit-button edit-name ${className}`}
            autoFocus
            autoComplete="off"
          />
          {formSubmitType.startsWith("lineName-") && (
            <ErrorMessage
              errors={errors}
              name={formSubmitType}
              as={StyledWarningMessage}
            />
          )}
        </FormLabel>
      )}
      {managementMode && (
        <NameEditButton
          type="button"
          className={`name-edit-button ${isEditingName ? "save" : "edit"}`}
          disabled={isEditingName && !isUpdated}
          onClick={handleClick}
        >
          {isEditingName ? saveButton : editButton}
        </NameEditButton>
      )}
    </EditNameWrapper>
  );
};
