import styled from "@emotion/styled";
import {
  KeyboardEvent,
  ReactNode,
  Ref,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

export type TTab = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: TTab[];
  // Controlled active tab id. When omitted the component manages its own state.
  activeTabId?: string;
  // Initially active tab id when uncontrolled. Defaults to the first tab.
  defaultTabId?: string;
  onTabChange?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
};

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TabList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 0.1rem solid #868686;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button`
  background: transparent;
  border: none;
  border-bottom: 0.2rem solid transparent;
  color: #d6d3d1;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0.8rem 1.2rem;
  transition:
    color 0.1s ease,
    border-color 0.1s ease;

  &:hover:not(:disabled) {
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[aria-selected="true"] {
    color: #ffffff;
    border-bottom-color: #1db954;
  }
`;

const TabPanel = styled.div`
  min-width: 0;

  &[hidden] {
    display: none;
  }
`;

export const Tabs = ({
  tabs,
  activeTabId,
  defaultTabId,
  onTabChange,
  className,
  ariaLabel,
  ref,
}: TabsProps) => {
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [internalActiveId, setInternalActiveId] = useState<string>(
    () => defaultTabId ?? tabs[0]?.id
  );

  const isControlled = activeTabId !== undefined;
  const currentId = isControlled ? activeTabId : internalActiveId;

  const selectTab = useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalActiveId(id);
      }
      onTabChange?.(id);
    },
    [isControlled, onTabChange]
  );

  const focusableTabs = tabs.filter((tab) => !tab.disabled);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (focusableTabs.length === 0) return;

      const currentIndex = focusableTabs.findIndex(
        (tab) => tab.id === currentId
      );
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIndex = (currentIndex + 1) % focusableTabs.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex =
            (currentIndex - 1 + focusableTabs.length) % focusableTabs.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = focusableTabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextTab = focusableTabs[nextIndex];
      if (nextTab) {
        selectTab(nextTab.id);
        tabRefs.current[nextTab.id]?.focus();
      }
    },
    [currentId, focusableTabs, selectTab]
  );

  if (tabs.length === 0) return null;

  return (
    <TabsWrapper className={className} ref={ref}>
      <TabList role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const isActive = tab.id === currentId;
          return (
            <TabButton
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              onClick={() => selectTab(tab.id)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </TabButton>
          );
        })}
      </TabList>
      {tabs.map((tab) => {
        const isActive = tab.id === currentId;
        return (
          <TabPanel
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={!isActive}
          >
            {tab.content}
          </TabPanel>
        );
      })}
    </TabsWrapper>
  );
};
