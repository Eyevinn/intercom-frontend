import styled from "@emotion/styled";
import { FC, useState, useMemo } from "react";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { useP2PCalls } from "../../hooks/use-p2p-calls.ts";

const ListContainer = styled.div`
  padding: 1rem 2rem;
`;

const ListTitle = styled.h2`
  font-size: 1.6rem;
  color: rgba(89, 203, 232, 1);
  margin-bottom: 1rem;
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  color: white;
  outline: none;
  box-sizing: border-box;
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  &:focus {
    border-color: rgba(89, 203, 232, 0.5);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FilterInfo = styled.div`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.4rem;
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: ${({ connected }) => connected ? 'rgba(29, 185, 84, 0.8)' : 'rgba(249, 108, 108, 0.8)'};
  margin-bottom: 0.8rem;
`;

const StatusDot = styled.span<{ connected: boolean }>`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: ${({ connected }) => connected ? '#1db954' : '#f96c6c'};
`;

const ClientCard = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  background: ${({ isCurrentUser }) =>
    isCurrentUser ? "rgba(89, 203, 232, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  border-radius: 0.5rem;
  border: 1px solid
    ${({ isCurrentUser }) =>
      isCurrentUser ? "rgba(89, 203, 232, 0.3)" : "transparent"};
`;

const OnlineDot = styled.span`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: #1db954;
  flex-shrink: 0;
  margin-right: 1rem;
`;

const InCallDot = styled.span`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: rgba(89, 203, 232, 1);
  flex-shrink: 0;
  margin-right: 0.5rem;
  animation: pulse 1.5s ease-in-out infinite;
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const ClientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ClientName = styled.span`
  font-weight: bold;
  font-size: 1.4rem;
  color: white;
`;

const YouSuffix = styled.span`
  font-size: 1.2rem;
  color: rgba(89, 203, 232, 0.8);
  margin-left: 0.5rem;
  font-weight: normal;
`;

const ClientMeta = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.2rem;
`;

const TalkingIndicator = styled.div`
  font-size: 1.1rem;
  color: rgba(89, 203, 232, 0.9);
  margin-top: 0.3rem;
  font-style: italic;
`;

const EmptyState = styled.p`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const CallButton = styled.button`
  background: rgba(89, 203, 232, 0.2);
  border: 1px solid rgba(89, 203, 232, 0.5);
  color: rgba(89, 203, 232, 1);
  border-radius: 0.4rem;
  padding: 0.3rem 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 0.5rem;
  &:hover {
    background: rgba(89, 203, 232, 0.3);
  }
`;

const EndCallButton = styled.button`
  background: rgba(249, 108, 108, 0.2);
  border: 1px solid rgba(249, 108, 108, 0.5);
  color: #f96c6c;
  border-radius: 0.4rem;
  padding: 0.3rem 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 0.5rem;
  &:hover {
    background: rgba(249, 108, 108, 0.3);
  }
`;

const CallIndicator = styled.span`
  font-size: 1.1rem;
  color: rgba(89, 203, 232, 0.8);
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;

export const ClientList: FC = () => {
  const [{ clients, currentClient, p2pCalls, activeTalks, websocket }] = useGlobalState();
  const { initiateCall, endCall } = useP2PCalls();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const isConnected = websocket !== null;

  return (
    <ListContainer>
      <ListTitle>Online Clients ({clients.length})</ListTitle>
      <ConnectionStatus connected={isConnected}>
        <StatusDot connected={isConnected} />
        {isConnected ? "Connected" : "Disconnected — reconnecting..."}
      </ConnectionStatus>
      {clients.length > 5 && (
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by name, role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <FilterInfo>
              Showing {filteredClients.length} of {clients.length} clients
            </FilterInfo>
          )}
        </SearchContainer>
      )}
      {filteredClients.length === 0 ? (
        <EmptyState>
          {searchQuery ? "No clients match your search" : "No other clients online"}
        </EmptyState>
      ) : (
        filteredClients.map((client) => {
          const isCurrentUser =
            currentClient !== null &&
            client.clientId === currentClient.clientId;

          // Check if there's an active call with this client
          const activeCallWithClient = Object.values(p2pCalls).find(
            (call) =>
              (call.calleeId === client.clientId ||
                call.callerId === client.clientId) &&
              call.state !== "ended"
          );

          // Check if this client is currently talking
          const clientTalk = activeTalks[client.clientId];

          // Check if the current user is being talked to by this client
          const currentUserBeingTalkedTo = currentClient && activeTalks[client.clientId]?.targets.some(
            (target) => target.clientId === currentClient.clientId
          );

          return (
            <ClientCard key={client.clientId} isCurrentUser={isCurrentUser}>
              <OnlineDot />
              <ClientInfo>
                <div>
                  <ClientName>{client.name}</ClientName>
                  {isCurrentUser && <YouSuffix>(You)</YouSuffix>}
                </div>
                <ClientMeta>
                  {client.role} &middot; {client.location}
                </ClientMeta>
                {clientTalk && (
                  <TalkingIndicator>
                    🎙 Talking to {clientTalk.targets.map((t) => t.clientName).join(", ")}
                  </TalkingIndicator>
                )}
                {currentUserBeingTalkedTo && (
                  <TalkingIndicator>
                    📢 Talking to you
                  </TalkingIndicator>
                )}
              </ClientInfo>
              {!isCurrentUser &&
                (activeCallWithClient ? (
                  <>
                    <CallIndicator>
                      <InCallDot />
                      In Call
                    </CallIndicator>
                    <EndCallButton
                      onClick={() => endCall(activeCallWithClient.callId)}
                    >
                      End
                    </EndCallButton>
                  </>
                ) : (
                  <CallButton onClick={() => initiateCall(client.clientId)}>
                    Call
                  </CallButton>
                ))}
            </ClientCard>
          );
        })
      )}
    </ListContainer>
  );
};
