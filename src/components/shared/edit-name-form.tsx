import { useEffect, useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormInput, FormLabel } from "../form-elements/form-elements";
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

  const isUpdated =
    savedItem &&
    "name" in savedItem &&
    (productionName !== savedItem?.name || hasLineChanges());

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
      const currentLineIndex = parseInt(
        formSubmitType.toString().split("-")[1],
        10
      );
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
    shouldSubmitOnEnter: isUpdated ?? false,
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
            {...register(formSubmitType)}
            placeholder="New Name"
            className={`name-edit-button edit-name ${className}`}
            autoComplete="off"
          />
        </FormLabel>
      )}
      {managementMode && (
        <NameEditButton
          type="button"
          className={`name-edit-button ${isEditingName ? "save" : "edit"}`}
          onClick={handleClick}
        >
          {isEditingName ? saveButton : editButton}
        </NameEditButton>
      )}
    </EditNameWrapper>
  );
};
