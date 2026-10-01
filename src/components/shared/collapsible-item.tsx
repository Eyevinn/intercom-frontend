import { useState, ReactNode } from "react";
import styled from "@emotion/styled";
import {
  CollapsibleItemWrapper,
  HeaderWrapper,
  HeaderTexts,
  HeaderIcon,
  ExpandableSection,
  InnerDiv,
} from "./shared-components";
import { ChevronUpIcon, ChevronDownIcon } from "../../assets/icons/icon";

const CollapsibleHeaderTexts = styled(HeaderTexts)`
  min-height: 3rem;
`;

type CollapsibleItemProps = {
  headerContent: ReactNode;
  expandedContent: ReactNode;
  onHeaderClick?: (
    e: React.MouseEvent,
    open: boolean,
    setOpen: (open: boolean) => void
  ) => void;
  className?: string;
  testId?: string;
};

export const CollapsibleItem = ({
  headerContent,
  expandedContent,
  onHeaderClick,
  className,
  testId,
}: CollapsibleItemProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (onHeaderClick) {
      onHeaderClick(e, open, setOpen);
    } else {
      setOpen(!open);
    }
  };

  return (
    <CollapsibleItemWrapper className={className} data-testid={testId}>
      <HeaderWrapper onClick={handleHeaderClick}>
        <CollapsibleHeaderTexts>{headerContent}</CollapsibleHeaderTexts>
        <HeaderIcon data-testid="chevron">
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HeaderIcon>
      </HeaderWrapper>
      <ExpandableSection className={open ? "expanded" : ""}>
        <InnerDiv>{expandedContent}</InnerDiv>
      </ExpandableSection>
    </CollapsibleItemWrapper>
  );
};
