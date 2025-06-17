import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSubmitOnEnter } from "../../../hooks/use-submit-form-enter-press";
import { ButtonWrapper } from "../../generic-components";
import { FormInput } from "../../form-elements/form-elements";
import { FormItem } from "../../user-settings-form/form-item";
import { FormWrapper, SubmitButton } from "../ingest-components";
import { useCreateIngest } from "./use-create-ingest";
import { Spinner } from "../../loader/loader";
import { SpinnerWrapper } from "../../delete-button/delete-button-components";

type FormValues = {
  ingestName: string;
  ipAddress: string;
};

type AddIngestFormProps = {
  onSave?: () => void;
};

export const AddIngestForm = ({ onSave }: AddIngestFormProps) => {
  const [createIngest, setCreateIngest] = useState<FormValues | null>(null);
  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
  } = useForm<FormValues>({
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const { loading, success } = useCreateIngest({ createIngest });

  useEffect(() => {
    if (success) {
      setCreateIngest(null);
      if (onSave) onSave();
    }
  }, [success, onSave]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setCreateIngest(data);
  };

  useSubmitOnEnter<FormValues>({
    handleSubmit,
    submitHandler: onSubmit,
    shouldSubmitOnEnter: true,
  });

  return (
    <FormWrapper>
      <FormItem label="Name" fieldName="ingestName" errors={errors}>
        <FormInput
          // eslint-disable-next-line
          {...register(`ingestName`, {
            required: "Ingest name is required",
            minLength: 1,
          })}
          placeholder="Name for Ingest"
        />
      </FormItem>
      <FormItem label="Server IP Address" fieldName="ipAddress" errors={errors}>
        <FormInput
          // eslint-disable-next-line
          {...register(`ipAddress`, {
            required: "IP address is required",
            minLength: 1,
          })}
          placeholder="192.168.1.1"
        />
      </FormItem>
      <ButtonWrapper>
        <SubmitButton
          type="button"
          disabled={!isValid}
          onClick={handleSubmit(onSubmit)}
          shouldSubmitOnEnter
        >
          Add Ingest
          {loading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </SubmitButton>
      </ButtonWrapper>
    </FormWrapper>
  );
};
