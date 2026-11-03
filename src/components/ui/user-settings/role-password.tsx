import type { ReactElement } from "react";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import { useGlobalState } from "../../../global-state/context-provider";
import { useRequestPermission } from "../../../hooks/use-request-permission";
import {
  ActionButton,
  DevicesSection,
  FormInput,
  PrimaryButton,
  SectionTitle,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { FormItem } from "../user-settings-form/form-item";

const Wrapper = styled.div`
  margin-top: 2rem;
`;

const ButtonRow = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const RoleStatus = styled.p`
  margin: 0 0 1rem;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.75);
`;

const RoleName = styled.span`
  font-weight: bold;
  text-transform: capitalize;
`;

type RolePasswordFormValues = {
  rolePassword: string;
};

/**
 * Role password section of user settings (Roles feature, #631).
 *
 * A masked password field whose value is exchanged with the manager permission
 * endpoint for a role and its feature flags (#632). When a role is already
 * held it shows the granted role and offers to clear it. Entirely optional —
 * users who never touch it keep the app's default (no-role) behaviour.
 */
export const RolePassword = (): ReactElement => {
  const [{ roleAuth }] = useGlobalState();
  const { requestPermission, clearPermission, loading, error } =
    useRequestPermission();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RolePasswordFormValues>({
    defaultValues: { rolePassword: "" },
  });

  const onSubmit = handleSubmit(async ({ rolePassword }) => {
    const success = await requestPermission(rolePassword);
    if (success) {
      reset({ rolePassword: "" });
    }
  });

  return (
    <Wrapper>
      <DevicesSection>
        <SectionTitle>Role</SectionTitle>
      </DevicesSection>
      {roleAuth ? (
        <>
          <RoleStatus>
            Signed in as <RoleName>{roleAuth.role}</RoleName>.
          </RoleStatus>
          <ButtonRow>
            <ActionButton
              type="button"
              onClick={() => {
                clearPermission();
                reset({ rolePassword: "" });
              }}
            >
              Clear role
            </ActionButton>
          </ButtonRow>
        </>
      ) : (
        <>
          <FormItem label="Role password" fieldName="rolePassword" errors={{}}>
            <FormInput
              type="password"
              autoComplete="off"
              placeholder="Enter role password"
              // eslint-disable-next-line
              {...register("rolePassword", {
                required: "A role password is required",
                minLength: 1,
                maxLength: {
                  value: 512,
                  message: "Role password is too long",
                },
              })}
            />
          </FormItem>
          {errors.rolePassword?.message && (
            <StyledWarningMessage>
              {errors.rolePassword.message}
            </StyledWarningMessage>
          )}
          {error && <StyledWarningMessage>{error}</StyledWarningMessage>}
          <ButtonRow>
            <PrimaryButton type="button" onClick={onSubmit} disabled={loading}>
              {loading ? "Verifying..." : "Unlock role"}
            </PrimaryButton>
          </ButtonRow>
        </>
      )}
    </Wrapper>
  );
};
