import styled from "@emotion/styled";

type TCheckboxProps = {
  label: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CheckboxComponent = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 2.4rem;
  height: 2.4rem;
  border: 0.2rem solid #6d6d6d;
  border-radius: 0.4rem;
  outline: none;
  cursor: pointer;
  background-color: #32383b;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  margin-right: 1rem;

  &:checked {
    background-color: rgba(89, 203, 232, 1);
    border-color: #6d6d6d;
  }

  &:checked::after {
    content: "✓";
    display: flex;
    justify-content: center;
    align-items: center;
    color: #482307;
    font-size: 1.6rem;
    font-weight: bold;
  }

  &:hover {
    background-color: rgba(89, 203, 232, 1);
  }
`;

export const Checkbox = ({ label, checked, onChange }: TCheckboxProps) => {
  return (
    <CheckboxWrapper>
      <CheckboxComponent
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label>{label}</label>
    </CheckboxWrapper>
  );
};
