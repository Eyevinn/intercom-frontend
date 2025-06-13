import { useState, ReactNode } from "react";
import {
  CollapsibleItemWrapper,
  HeaderWrapper,
  HeaderTexts,
  HeaderIcon,
  ExpandableSection,
  InnerDiv,
} from "./shared-components";
import { ChevronUpIcon, ChevronDownIcon } from "../../assets/icons/icon";

type CollapsibleItemProps = {
  headerContent: ReactNode;
  expandedContent: ReactNode;
  onHeaderClick?: (
    e: React.MouseEvent,
    open: boolean,
    setOpen: (open: boolean) => void
  ) => void;
  className?: string;
};

export const CollapsibleItem = ({
  headerContent,
  expandedContent,
  onHeaderClick,
  className,
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
    <CollapsibleItemWrapper className={className}>
      <HeaderWrapper onClick={handleHeaderClick}>
        <HeaderTexts open={open} isProgramOutputLine={false}>
          {headerContent}
        </HeaderTexts>
        <HeaderIcon>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HeaderIcon>
      </HeaderWrapper>
      <ExpandableSection className={open ? "expanded" : ""}>
        <InnerDiv>{expandedContent}</InnerDiv>
      </ExpandableSection>
    </CollapsibleItemWrapper>
  );
};
