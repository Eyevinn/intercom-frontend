import styled from "@emotion/styled";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation } from "react-router";
import { ShareIcon } from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { useCallList } from "../../hooks/use-call-list";
import {
  buildCallsUrl,
  parseCompanionParam,
  type CallRef,
} from "../../utils/call-url";
import { API } from "../../api/api";
import { CopyIconWrapper } from "../copy-button/copy-components";
import { JoinProduction } from "../landing-page/join-production";
import { UserSettingsButton } from "../landing-page/user-settings-button";
import { isMobile } from "../../bowser";
import { Modal } from "../modal/modal";
import { PageHeader } from "../page-layout/page-header";
import { useAudioCue } from "../production-line/use-audio-cue";
import { useGlobalHotkeys } from "../production-line/use-line-hotkeys";
import { ShareUrlModal } from "../share-url-modal/share-url-modal";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { UserSettings } from "../user-settings/user-settings";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { HeaderActions } from "./header-actions";
import { ProductionLines } from "./production-lines";
import { ProgramLineJoinCard } from "./program-line-join-card";
import { useCallsNavigation } from "./use-calls-navigation";
import { useGlobalMuteHotkey } from "./use-global-mute-hotkey";
import { usePreventPullToRefresh } from "./use-prevent-pull-to-refresh";
import { useSpeakerDetection } from "./use-speaker-detection";
import { useSendWSCallStateUpdate } from "./use-send-ws-callstate-update";

const ShareAdornment = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.3rem;
  margin-top: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const CallsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  padding: 0 2rem 2rem 2rem;
  max-width: 100%;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 1rem 1rem 1rem;
  }

  form {
    margin: 0;
  }
`;

export const CallsPage = () => {
  const [productionId, setProductionId] = useState<string | null>(null);
  const [addCallActive, setAddCallActive] = useState<boolean>(false);
  const [confirmExitModalOpen, setConfirmExitModalOpen] =
    useState<boolean>(false);
  const [isMasterInputMuted, setIsMasterInputMuted] = useState<boolean>(true);
  const [{ calls, selectedProductionId, websocket, userSettings }, dispatch] =
    useGlobalState();
  type PendingProgramLine = {
    productionId: string;
    lineId: string;
    lineName?: string;
    productionName?: string;
    presetOrder: number;
  };

  const splitStartedRef = useRef(false);
  const [validatedCallRefs, setValidatedCallRefs] = useState<CallRef[] | null>(
    null
  );
  const [pendingProgramLines, setPendingProgramLines] = useState<
    PendingProgramLine[]
  >([]);
  const {
    deregisterCall,
    registerCallList,
    sendCallsStateUpdate,
    resetLastSentCallsState,
  } = useCallList({
    websocket,
    globalMute: isMasterInputMuted,
    numberOfCalls: Object.values(calls).length,
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSettingGlobalMute, setIsSettingGlobalMute] =
    useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { initiateProductionCall } = useInitiateProductionCall({ dispatch });
  const autoJoinTriggeredRef = useRef(false);
  const pendingProgramKeysRef = useRef<Set<string>>(new Set());

  const { productionId: paramProductionId, lineId: paramLineId } = useParams();
  const { search } = useLocation();
  const autoCompanionUrl = parseCompanionParam(
    new URLSearchParams(search).get("companion")
  );
  const [manualCompanionUrl, setManualCompanionUrl] = useState<
    string | undefined
  >(undefined);
  const activeCompanionUrl = manualCompanionUrl ?? autoCompanionUrl;

  const { navigate, pendingCallRefs } = useCallsNavigation({
    isEmpty: Object.values(calls).length === 0,
    paramProductionId,
    paramLineId,
    calls,
    pendingProgramLineRefs: pendingProgramLines.map((p) => ({
      productionId: p.productionId,
      lineId: p.lineId,
    })),
  });

  const isEmpty = Object.values(calls).length === 0;
  const isSingleCall = Object.values(calls).length === 1;

  const isFirstConnection = isEmpty && paramProductionId && paramLineId;

  const isProgramOutputAdded = Object.entries(calls).some(
    ([, callState]) =>
      callState.joinProductionOptions?.lineUsedForProgramOutput &&
      !callState.joinProductionOptions.isProgramUser
  );

  const callActionHandlers = useRef<Record<string, Record<string, () => void>>>(
    {}
  );
  const callIndexMap = useRef<Record<number, string>>({});

  const presetOrderMap = useMemo(
    () =>
      new Map(
        pendingCallRefs.map((ref, i) => [
          `${ref.productionId}:${ref.lineId}`,
          i,
        ])
      ),
    [pendingCallRefs]
  );

  const { shouldReduceVolume } = useSpeakerDetection({
    isProgramOutputAdded,
    calls,
  });

  const customGlobalMute = useGlobalMuteHotkey({
    calls,
    initialHotkey: "p",
  });

  useEffect(() => {
    callIndexMap.current = {};
    const sorted = Object.entries(calls).sort(([, a], [, b]) => {
      const keyA = a.joinProductionOptions
        ? `${a.joinProductionOptions.productionId}:${a.joinProductionOptions.lineId}`
        : "";
      const keyB = b.joinProductionOptions
        ? `${b.joinProductionOptions.productionId}:${b.joinProductionOptions.lineId}`
        : "";
      const orderA = presetOrderMap.get(keyA) ?? Infinity;
      const orderB = presetOrderMap.get(keyB) ?? Infinity;
      return orderA - orderB;
    });
    sorted.forEach(([callId], i) => {
      callIndexMap.current[i + 1] = callId;
    });
  }, [calls, presetOrderMap]);

  useEffect(() => {
    if (splitStartedRef.current) return;
    splitStartedRef.current = true;

    if (pendingCallRefs.length === 0) {
      setValidatedCallRefs([]);
      return;
    }

    const productionIds = [
      ...new Set(pendingCallRefs.map((r) => r.productionId)),
    ];

    Promise.allSettled(
      productionIds.map((pid) =>
        API.fetchProduction(Number(pid)).then((prod) => ({ pid, prod }))
      )
    )
      .then((results) => {
        const productionsById = new Map(
          results
            .filter(
              (
                r
              ): r is PromiseFulfilledResult<{
                pid: string;
                prod: Awaited<ReturnType<typeof API.fetchProduction>>;
              }> => r.status === "fulfilled"
            )
            .map(({ value }) => [value.pid, value.prod])
        );

        const program: PendingProgramLine[] = [];
        const validRefs: typeof pendingCallRefs = [];

        pendingCallRefs.forEach((ref, i) => {
          const prod = productionsById.get(ref.productionId);
          const line = prod?.lines.find(
            (l) => String(l.id) === String(ref.lineId)
          );
          if (!prod || !line) return;
          validRefs.push(ref);
          if (line.programOutputLine === true && !ref.role) {
            program.push({
              productionId: ref.productionId,
              lineId: ref.lineId,
              presetOrder: i,
              productionName: prod.name,
              lineName: line.name,
            });
          }
        });

        if (program.length > 0) {
          pendingProgramKeysRef.current = new Set(
            program.map((p) => `${p.productionId}:${p.lineId}`)
          );
          setPendingProgramLines(program);
        }

        if (validRefs.length !== pendingCallRefs.length) {
          navigate(buildCallsUrl(validRefs, autoCompanionUrl), {
            replace: true,
          });
        }

        setValidatedCallRefs(validRefs);
      })
      .catch(() => {
        setValidatedCallRefs(pendingCallRefs);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCallRefs]);

  usePreventPullToRefresh();

  useEffect(() => {
    if (validatedCallRefs === null) return;
    if (autoJoinTriggeredRef.current) return;
    if (validatedCallRefs.length === 0) return;
    if (!userSettings?.username) return;

    autoJoinTriggeredRef.current = true;

    const programKeys = pendingProgramKeysRef.current;

    const existingKeys = new Set(
      Object.values(calls)
        .map((c) => c.joinProductionOptions)
        .filter(Boolean)
        .map((o) => `${o!.productionId}:${o!.lineId}`)
    );

    validatedCallRefs
      .filter(
        (ref) =>
          !programKeys.has(`${ref.productionId}:${ref.lineId}`) &&
          !existingKeys.has(`${ref.productionId}:${ref.lineId}`)
      )
      .forEach((ref) => {
        initiateProductionCall({
          payload: {
            joinProductionOptions: {
              productionId: ref.productionId,
              lineId: ref.lineId,
              username: userSettings.username!,
              audioinput: userSettings.audioinput,
              lineUsedForProgramOutput: ref.role === "l" || ref.role === "p",
              isProgramUser: ref.role === "p",
            },
            audiooutput: userSettings.audiooutput,
          },
          customGlobalMute,
        });
      });
  }, [
    validatedCallRefs,
    userSettings,
    calls,
    initiateProductionCall,
    customGlobalMute,
  ]);

  useEffect(() => {
    if (selectedProductionId) {
      setProductionId(selectedProductionId);
    }
  }, [selectedProductionId]);

  useSendWSCallStateUpdate({
    isSettingGlobalMute,
    isEmpty,
    sendCallsStateUpdate,
  });

  useGlobalHotkeys({
    muteInput: setIsMasterInputMuted,
    isInputMuted: isMasterInputMuted,
    customKey: customGlobalMute,
  });

  const handleCompanionUrlChange = (url: string | undefined) => {
    setManualCompanionUrl(url);
    navigate(buildCallsUrl(pendingCallRefs, url), { replace: true });
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const shareCallRefs = pendingCallRefs;

  const orderedPresetCalls = pendingCallRefs.map((ref) => {
    const joined = Object.values(calls).find(
      (c) =>
        c.joinProductionOptions?.productionId === ref.productionId &&
        c.joinProductionOptions?.lineId === ref.lineId
    );
    if (joined?.joinProductionOptions) {
      const o = joined.joinProductionOptions;
      return {
        productionId: ref.productionId,
        lineId: ref.lineId,
        ...(o.lineUsedForProgramOutput
          ? {
              lineUsedForProgramOutput: true as const,
              isProgramUser: !!o.isProgramUser,
            }
          : {}),
        ...(o.lineName ? { lineName: o.lineName } : {}),
      };
    }
    const pending = pendingProgramLines.find(
      (p) => p.productionId === ref.productionId && p.lineId === ref.lineId
    );
    return {
      productionId: ref.productionId,
      lineId: ref.lineId,
      lineUsedForProgramOutput: true as const,
      isProgramUser: ref.role === "p",
      ...(pending?.lineName ? { lineName: pending.lineName } : {}),
    };
  });

  const { playExitSound } = useAudioCue();

  const runExitAllCalls = async () => {
    setProductionId(null);
    playExitSound();
    navigate("/");
    if (!isEmpty) {
      Object.entries(calls).forEach(([callId]) => {
        if (callId) {
          dispatch({
            type: "REMOVE_CALL",
            payload: { id: callId },
          });
          deregisterCall(callId);
        }
      });
    }
  };

  return (
    <>
      {!isFirstConnection && !isMobile && (
        <UserSettingsButton onClick={() => setShowSettings(!showSettings)} />
      )}
      <PageHeader
        title={!isEmpty ? "Lines" : ""}
        titleAdornment={
          !isEmpty ? (
            <ShareAdornment>
              <CopyIconWrapper
                title="Share lines URL"
                isCopied={false}
                onClick={handleShare}
                style={{ padding: 0 }}
              >
                <ShareIcon />
              </CopyIconWrapper>
            </ShareAdornment>
          ) : undefined
        }
        hasNavigateToRoot
        onNavigateToRoot={() => {
          if (isEmpty) {
            runExitAllCalls();
          } else {
            setConfirmExitModalOpen(true);
          }
        }}
      >
        {confirmExitModalOpen && (
          <ConfirmationModal
            title="Confirm"
            description="Are you sure you want to leave all lines?"
            confirmationText="This will leave all lines and return to the home page."
            onCancel={() => setConfirmExitModalOpen(false)}
            onConfirm={runExitAllCalls}
          />
        )}

        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="User Settings">
            <UserSettings
              buttonText="Save"
              needsConfirmation
              onSave={() => setShowSettings(false)}
              hideTitle
            />
          </Modal>
        )}

        {shareModalOpen && (
          <ShareUrlModal
            path={buildCallsUrl(shareCallRefs)}
            companionUrl={activeCompanionUrl}
            title="Share Current Configuration"
            onClose={() => setShareModalOpen(false)}
          />
        )}

        <HeaderActions
          setIsSettingGlobalMute={setIsSettingGlobalMute}
          isEmpty={isEmpty}
          isSingleCall={isSingleCall}
          isMasterInputMuted={isMasterInputMuted}
          setIsMasterInputMuted={setIsMasterInputMuted}
          addCallActive={addCallActive}
          setAddCallActive={setAddCallActive}
          callIndexMap={callIndexMap}
          callActionHandlers={callActionHandlers}
          sendCallsStateUpdate={sendCallsStateUpdate}
          resetLastSentCallsState={resetLastSentCallsState}
          autoCompanionUrl={autoCompanionUrl}
          onCompanionUrlChange={handleCompanionUrlChange}
          orderedPresetCalls={orderedPresetCalls}
        />
      </PageHeader>
      <Container>
        {isEmpty && pendingCallRefs.length > 0 && !userSettings?.username && (
          <JoinProduction
            preSelected={{
              preSelectedProductionId: pendingCallRefs[0].productionId,
              preSelectedLineId: pendingCallRefs[0].lineId,
            }}
            customGlobalMute={customGlobalMute}
            updateUserSettings
          />
        )}
        {isEmpty &&
          !pendingCallRefs.length &&
          paramProductionId &&
          paramLineId && (
            <JoinProduction
              preSelected={{
                preSelectedProductionId: paramProductionId,
                preSelectedLineId: paramLineId,
              }}
              customGlobalMute={customGlobalMute}
              updateUserSettings
            />
          )}
        <CallsContainer>
          {addCallActive && productionId && (
            <JoinProduction
              customGlobalMute={customGlobalMute}
              addAdditionalCallId={productionId}
              closeAddCallView={() => setAddCallActive(false)}
              className="calls-page"
              hideUsername
              hideDevices
            />
          )}
          {!!(
            userSettings &&
            userSettings.username &&
            (userSettings.audioinput || userSettings.audiooutput)
          ) &&
            pendingProgramLines
              .filter(
                (ref) =>
                  !Object.values(calls).some(
                    (c) =>
                      c.joinProductionOptions?.productionId ===
                        ref.productionId &&
                      c.joinProductionOptions?.lineId === ref.lineId
                  )
              )
              .map((ref) => (
                <ProgramLineJoinCard
                  key={`${ref.productionId}:${ref.lineId}`}
                  productionId={ref.productionId}
                  lineId={ref.lineId}
                  lineName={ref.lineName}
                  productionName={ref.productionName}
                  presetOrder={ref.presetOrder}
                  customGlobalMute={customGlobalMute}
                  onJoined={() =>
                    setPendingProgramLines((prev) =>
                      prev.filter(
                        (r) =>
                          !(
                            r.productionId === ref.productionId &&
                            r.lineId === ref.lineId
                          )
                      )
                    )
                  }
                />
              ))}
          <ProductionLines
            isSettingGlobalMute={isSettingGlobalMute}
            setAddCallActive={setAddCallActive}
            isMasterInputMuted={isMasterInputMuted}
            customGlobalMute={customGlobalMute}
            isSingleCall={isSingleCall}
            callActionHandlers={callActionHandlers}
            shouldReduceVolume={shouldReduceVolume}
            calls={calls}
            registerCallList={registerCallList}
            deregisterCall={deregisterCall}
            callOrderMap={presetOrderMap}
          />
        </CallsContainer>
      </Container>
    </>
  );
};
