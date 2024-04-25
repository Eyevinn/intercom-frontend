import { ChangeHandler, RefCallBack } from "react-hook-form";
import styled from "@emotion/styled";
import { Spinner } from "../loader/loader";
import { FormLabel, DecorativeLabel, FormInput } from "./form-elements";

type TFormInputWithLoader = {
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  inputRef: RefCallBack;
  onBlur: ChangeHandler;
  type: string;
  loading: boolean;
};

const InputWrapper = styled.div`
  position: relative;
`;

export const FormInputWithLoader = ({
  label,
  placeholder,
  onChange,
  name,
  inputRef,
  onBlur,
  type,
  loading,
}: TFormInputWithLoader) => {
  return (
    <FormLabel>
      <DecorativeLabel>{label}</DecorativeLabel>
      <InputWrapper>
        <FormInput
          className="with-loader"
          onChange={onChange}
          name={name}
          ref={inputRef}
          onBlur={onBlur}
          type={type}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && <Spinner className="form-loader" />}
      </InputWrapper>
    </FormLabel>
  );
};
