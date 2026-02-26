import styled from "@emotion/styled";
import { PrimaryButton } from "../form-elements/form-elements";

export const ProductionName = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin-right: 0.5rem;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .production-name-container {
    display: inline-block;
    width: 100%;
  }
`;

export const ParticipantCountWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  margin-right: 1rem;

  svg {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  &.active {
    svg {
      fill: #73d16d;
    }
  }

  &.whip {
    svg {
      fill: rgb(89, 203, 232);
    }
  }
`;

export const ParticipantCount = styled.div`
  font-size: 1.5rem;
  color: #9e9e9e;
`;

export const Lineblock = styled.div`
  margin-top: 1rem;
  background-color: ${({ isProgramOutput }: { isProgramOutput?: boolean }) =>
    isProgramOutput ? "rgb(73, 67, 124)" : "rgb(77, 77, 77)"};
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  min-height: 6.5rem;
  min-width: 0;
  overflow: hidden;
`;

export const LineBlockTexts = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const LineBlockTitle = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const LineBlockTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;

  &.management {
    margin-right: 1rem;
  }
`;

export const ParticipantExpandBtn = styled.button`
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: #a6a6a6;

  &:hover {
    text-decoration: underline;
  }

  svg {
    fill: #a6a6a6;
    width: 2rem;
    margin-top: 0.3rem;
    flex-shrink: 0;
  }
`;

export const LineBlockParticipants = styled.div``;

export const LineBlockParticipant = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;

  svg {
    fill: #7be27b;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
  }

  &.whip {
    svg {
      fill: rgb(89, 203, 232);
    }
  }
`;

export const PersonText = styled.div`
  margin-left: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const AddLineSectionForm = styled.form`
  margin-top: 1rem;
  border: 1px grey solid;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow: visible;
`;

export const ManageLineInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  > *:first-of-type {
    flex: 1;
    min-width: 0;
  }

  label {
    margin-bottom: 0;
  }

  input,
  select {
    margin-bottom: 0;
  }
`;

export const CreateLineButton = styled(PrimaryButton)`
  float: right;
`;

export const AddLineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const RemoveIconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  &:hover {
    cursor: pointer;
  }

  svg {
    fill: #f96c6c;
  }
`;

export const IconWrapper = styled.div`
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 100%;
    width: 100%;
  }
`;

export const ProductionNameWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 30rem;
  flex: 1;
  min-width: 0;
`;
