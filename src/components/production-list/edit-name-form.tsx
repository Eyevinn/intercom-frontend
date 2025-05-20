import { useEffect, useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormInput, FormLabel } from "../landing-page/form-elements";
import { EditNameWrapper, NameEditButton } from "./production-list-components";
import { SaveIcon, EditIcon } from "../../assets/icons/icon";
import { TBasicProductionResponse } from "../../api/api";
import { useSubmitOnEnter } from "../../hooks/use-submit-form-enter-press";
import { useEditLineName } from "../manage-productions-page/use-edit-line-name";
import { useEditProductionName } from "../manage-productions-page/use-edit-production-name";
import { useGlobalState } from "../../global-state/context-provider";
import { Spinner } from "../loader/loader";
import { useOutsideClickHandler } from "../../hooks/use-outside-click-handler";
import { LabelField } from "./labelField";

type FormValues = {
  productionName: string;
  [key: `lineName-${string}`]: string;
};

type EditNameFormProps = {
  production: TBasicProductionResponse;
  formSubmitType: `lineName-${string}` | "productionName";
  managementMode: boolean;
  setEditNameOpen: (editNameOpen: boolean) => void;
};

export const EditNameForm = ({
  production,
  formSubmitType,
  managementMode,
  setEditNameOpen,
}: EditNameFormProps) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [savedProduction, setSavedProduction] =
    useState<TBasicProductionResponse | null>(null);
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
    setIsEditingName(false);
    setSavedProduction(null);
  });

  const lineIndex = parseInt(formSubmitType.toString().split("-")[1], 10);
  const line = production.lines[lineIndex];

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
    if (!savedProduction?.lines) return false;
    return savedProduction.lines.some(
      (l, index) =>
        formValues[`lineName-${index}`] &&
        formValues[`lineName-${index}`] !== l.name
    );
  };

  const isUpdated =
    productionName !== savedProduction?.name || hasLineChanges();

  useEffect(() => {
    if (savedProduction?.name) {
      setValue(`productionName`, savedProduction.name);
    }
    if (savedProduction?.lines) {
      savedProduction.lines.forEach((l, index) => {
        setValue(`lineName-${index}`, l.name);
      });
    }
  }, [savedProduction, setValue]);

  useEffect(() => {
    if (successfullEditLine || successfullEditProduction) {
      setEditLineId(null);
      setEditProductionId(null);
      setEditNameOpen(false);
      setIsEditingName(false);
      setSavedProduction(null);
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
      data.productionName !== "" &&
      data.productionName !== savedProduction?.name &&
      savedProduction?.name
    ) {
      setEditProductionId({
        productionId: savedProduction.productionId,
        name: data.productionName,
      });
      return; // Exit early if we're updating production name
    }

    // Only update the line that matches our current label
    if (formSubmitType !== "productionName" && savedProduction) {
      const currentLineIndex = parseInt(
        formSubmitType.toString().split("-")[1],
        10
      );
      const currentLine = savedProduction.lines[currentLineIndex];
      const newName = data[`lineName-${currentLineIndex}`];

      if (currentLine && newName !== "" && currentLine.name !== newName) {
        setEditLineId({
          productionId: savedProduction.productionId,
          lineId: currentLine.id,
          name: newName,
        });
      }
    }
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: isUpdated,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to HeaderWrapper
    if (isEditingName) {
      handleSubmit(onSubmit)();
    } else {
      setSavedProduction(production);
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
        {!isEditingName && (
          <LabelField
            isLabelProductionName={formSubmitType === "productionName"}
            production={production}
            line={line}
            managementMode={managementMode}
          />
        )}
        {isEditingName && (
          <FormLabel className="save-edit">
            <FormInput
              // eslint-disable-next-line
              {...register(formSubmitType)}
              placeholder="New Name"
              className="name-edit-button edit-name"
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
