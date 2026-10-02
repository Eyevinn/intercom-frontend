import styled from "@emotion/styled";

type TCheckboxProps = {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const CheckboxWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  user-select: none;
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
    color: #1a1a1a;
    font-size: 1.6rem;
    font-weight: bold;
  }

  &:hover:not(:disabled) {
    background-color: rgba(89, 203, 232, 1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const DisabledLabel = styled.label<{ disabled?: boolean }>`
  ${({ disabled }) => (disabled ? "opacity: 0.45; cursor: not-allowed;" : "")}
`;

export const Checkbox = ({
  label,
  checked,
  disabled,
  onChange,
}: TCheckboxProps) => {
  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    onChange({
      target: { checked: next, type: "checkbox" },
      currentTarget: { checked: next, type: "checkbox" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <CheckboxWrapper disabled={disabled} onClick={toggle}>
      <CheckboxComponent
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        readOnly
        tabIndex={-1}
      />
      <DisabledLabel disabled={disabled}>{label}</DisabledLabel>
    </CheckboxWrapper>
  );
};
