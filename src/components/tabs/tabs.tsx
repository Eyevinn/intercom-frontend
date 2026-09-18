import styled from "@emotion/styled";

type TTab = {
  id: string;
  label: string;
};

type TTabsProps = {
  tabs: TTab[];
  activeTab: string;
  onChange: (id: string) => void;
};

const TabsWrapper = styled.div`
  display: flex;
  border-bottom: 0.1rem solid #424242;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.6rem;
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  color: ${({ active }) => (active ? "rgba(89, 203, 232, 1)" : "#bdbdbd")};
  cursor: pointer;
  position: relative;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -0.1rem;
    height: 0.2rem;
    background-color: ${({ active }) =>
      active ? "rgba(89, 203, 232, 1)" : "transparent"};
    transition: background-color 0.2s ease;
  }

  &:hover:not(:disabled) {
    color: rgba(89, 203, 232, 1);
  }

  &:focus-visible {
    outline: 0.2rem solid rgba(89, 203, 232, 1);
    outline-offset: 0.2rem;
    border-radius: 0.2rem;
  }
`;

export const Tabs = ({ tabs, activeTab, onChange }: TTabsProps) => (
  <TabsWrapper role="tablist">
    {tabs.map((tab) => (
      <TabButton
        key={tab.id}
        role="tab"
        type="button"
        active={tab.id === activeTab}
        aria-selected={tab.id === activeTab}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </TabButton>
    ))}
  </TabsWrapper>
);
