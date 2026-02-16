import styled from "@emotion/styled";
import { FC, FormEvent, useState } from "react";
import {
  FormInput,
  FormSelect,
  FormLabel,
  DecorativeLabel,
  PrimaryButton,
} from "../form-elements/form-elements.ts";
import { ResponsiveFormContainer } from "../generic-components.ts";
import { API } from "../../api/api.ts";
import { getExistingClientIdForRegistration, setAuth } from "../../api/auth.ts";
import { isMobile } from "../../bowser.ts";
import { TRegistrationForm } from "./types.ts";

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 4rem;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  margin-bottom: 2rem;
  color: rgba(89, 203, 232, 1);
`;

const ReturningUserText = styled.p`
  font-size: 1.2rem;
  color: rgba(89, 203, 232, 0.7);
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const ErrorText = styled.p`
  color: #f96c6c;
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const ROLE_OPTIONS = [
  { value: "", label: "Select a role..." },
  { value: "producer", label: "Producer" },
  { value: "reporter", label: "Reporter" },
  { value: "technician", label: "Technician" },
  { value: "editor", label: "Editor" },
  { value: "host", label: "Host" },
  { value: "other", label: "Other" },
];

type RegistrationPageProps = {
  onRegistered: (client: {
    clientId: string;
    name: string;
    role: string;
    location: string;
  }) => void;
};

export const RegistrationPage: FC<RegistrationPageProps> = ({
  onRegistered,
}) => {
  const existingClientId = getExistingClientIdForRegistration();
  const [form, setForm] = useState<TRegistrationForm>({
    name: "",
    role: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.role) {
      setError("Please select a role");
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required");
      return;
    }

    setLoading(true);
    try {
      const result = await API.registerClient({
        name: form.name.trim(),
        role: form.role,
        location: form.location.trim(),
        ...(existingClientId ? { existingClientId } : {}),
      });

      setAuth(result.token, result.clientId);

      onRegistered({
        clientId: result.clientId,
        name: result.name,
        role: result.role,
        location: result.location,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ResponsiveFormContainer
        className={isMobile ? "" : "desktop"}
        onSubmit={handleSubmit}
      >
        <Title>Register / Sign In</Title>

        {existingClientId && (
          <ReturningUserText>
            Reconnecting as returning user...
          </ReturningUserText>
        )}

        {error && <ErrorText>{error}</ErrorText>}

        <FormLabel>
          <DecorativeLabel>Name</DecorativeLabel>
          <FormInput
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            required
            autoFocus
          />
        </FormLabel>

        <FormLabel>
          <DecorativeLabel>Role</DecorativeLabel>
          <FormSelect
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            required
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FormSelect>
        </FormLabel>

        <FormLabel>
          <DecorativeLabel>Location</DecorativeLabel>
          <FormInput
            type="text"
            value={form.location}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="e.g. Stockholm, Goteborg"
            required
          />
        </FormLabel>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Connecting..." : "Connect"}
        </PrimaryButton>
      </ResponsiveFormContainer>
    </PageContainer>
  );
};
