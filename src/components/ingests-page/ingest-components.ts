import styled from "@emotion/styled";
import { PrimaryButton } from "../form-elements/form-elements";

export const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1rem;
`;

export const HeaderText = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-right: 0.5rem;

  .production-name-container {
    display: inline-block;
    width: 100%;
  }
`;

export const Text = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 3.2rem;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
`;

export const NoDevices = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
  padding: 1rem;
`;

export const DeviceWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  overflow: hidden;
`;

export const DeviceSection = styled.div`
  margin-bottom: 2rem;
`;

export const DeviceTable = styled.div`
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  overflow: hidden;
`;

export const DeviceTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  background-color: #1a1a1a;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #404040;
`;

export const DeviceTableHeaderCell = styled.div`
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
`;

export const DeviceTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #404040;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #333;
  }
`;

export const DeviceTableCell = styled.div`
  color: white;
  font-size: 0.95rem;
  margin-right: 1rem;
`;

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
`;

export const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 2rem;
  align-items: flex-start;
`;

export const SubmitButton = styled(PrimaryButton)<{
  shouldSubmitOnEnter?: boolean;
}>`
  outline: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px solid #007bff" : "none"};
  outline-offset: ${({ shouldSubmitOnEnter }) =>
    shouldSubmitOnEnter ? "2px" : "0"};
`;

export const StatusDot = styled.div<{ isActive: boolean }>`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${({ isActive }) => (isActive ? "#22c55e" : "#ef4444")};
  margin-right: 1rem;
`;
