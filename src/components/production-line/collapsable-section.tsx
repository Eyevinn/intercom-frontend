import styled from "@emotion/styled";
import { FC, PropsWithChildren, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../../assets/icons/icon";

const SectionWrapper = styled.div`
  border: 0.2rem #6d6d6d solid;
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3rem;
  font-weight: bold;

  &:hover {
    cursor: pointer;
  }
`;

const SectionTitle = styled.div``;

const SectionCollapser = styled.div`
  width: 3rem;
  height: 3rem;
`;

const SectionBody = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s ease-out;

  &.open {
    grid-template-rows: 1fr;
  }
`;

const SectionInner = styled.div`
  overflow: hidden;
`;

interface CollapsableSectionProps extends PropsWithChildren {
  title: string;
  startOpen?: boolean;
}

export const CollapsableSection: FC<CollapsableSectionProps> = (props) => {
  const { title, startOpen = false, children } = props;

  const [open, setOpen] = useState<boolean>(startOpen);

  return (
    <SectionWrapper>
      <SectionHeader onClick={() => setOpen(!open)}>
        <SectionTitle>{title}</SectionTitle>
        <SectionCollapser>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </SectionCollapser>
      </SectionHeader>
      <SectionBody className={open ? "open" : "closed"}>
        <SectionInner>{children}</SectionInner>
      </SectionBody>
    </SectionWrapper>
  );
};
