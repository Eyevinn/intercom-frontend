# Mute State Model: Admin-Mute vs Self-Mute and Unmute Semantics

This document defines the state model and data-channel payload contract that
distinguishes an **admin-forced mute** from a participant's **own self-mute**,
and specifies the unmute semantics for each.

It is a **specification / contract** document. It describes the current behaviour
accurately and defines the target model, but it does not change any runtime code.
Implementation is tracked in the follow-up issues referenced below.

- Part of #280 / breakdown of #637.
- Defined by: #677 (this document).
- Implemented by: #676 (admin mute/unmute UI + payload) and #678 (target-client
  state propagation and effective-mute logic).

---

## 1. Current behaviour

Today there is a single remote-mute path and **no distinction** between a mute
an admin forced on a participant and a mute the participant chose for
themselves. There is also no documented unmute payload.

### 1.1 Sending a mute (admin side)

`muteParticipant()` in
`src/components/production-line/production-line.tsx` sends a data-channel
message over the open SMB `RTCDataChannel`:

```json
{
  "type": "EndpointMessage",
  "to": "<targetUserId>",
  "payload": {
    "muteParticipant": "mute"
  }
}
```

### 1.2 Receiving a mute (target side)

1. `parseDataChannelMessage(data)` in
   `src/components/production-line/data-channel-parser.ts` validates the JSON and
   returns an `EndpointMessage` whose `payload` carries
   `muteParticipant?: string` (and/or `forceDisconnect?: string`).
2. `isRemoteMute(msg)` returns
   `msg.payload.muteParticipant === "mute" && msg.to !== msg.from`
   (the `to !== from` guard ignores self-addressed echoes).
3. `onDataChannelMessage` in
   `src/components/production-line/use-rtc-connection.ts` dispatches
   `UPDATE_CALL` with `updates: { isRemotelyMuted: isRemoteMute(message) }`.
4. `isRemotelyMuted` lives on `CallState` in `src/global-state/types.ts`.
5. An effect in `production-line.tsx` reacts:
   `if (isRemotelyMuted && !isProgramOutputLine) muteInput(true)`.
6. `muteInput(true)` in
   `src/components/production-line/use-mute-input.tsx` sets
   `track.enabled = false` on every input track, sets the local
   `isInputMuted = true`, and — because the mute was consumed — dispatches
   `isRemotelyMuted: false` back to the store.

### 1.3 Gaps this document closes

- **No admin/self distinction.** There is only one local `isInputMuted`
  boolean. An admin mute and a self mute are indistinguishable once applied, so
  the system cannot reason about "who muted whom".
- **No unmute payload.** `parseDataChannelMessage` already tolerates an
  arbitrary `muteParticipant` string (so `"unmute"` parses), but `isRemoteMute`
  only recognises `"mute"`, and nothing acts on an unmute. There is no contract
  for admin-unmute.
- **Risk of overwriting self-mute.** A naive admin-unmute that force-sets
  `track.enabled = true` would override a participant who deliberately muted
  themselves — violating the broadcast-privacy norm used by RTS / Clear-Com
  panels, where an admin cannot force a self-muted operator live.

---

## 2. Target state model

The target client tracks **two independent boolean states** per call. Neither
overwrites the other; they are composed at the point audio is applied.

| State        | Owner              | Meaning                                                  |
| ------------ | ------------------ | -------------------------------------------------------- |
| `selfMuted`  | The participant    | The participant muted their own input.                   |
| `adminMuted` | An admin / another client | An admin forced this participant muted via data channel. |

Both are stored on `CallState`
(`src/global-state/types.ts`). `adminMuted` replaces the single-shot role that
`isRemotelyMuted` plays today; `selfMuted` is the persisted form of the local
`isInputMuted` toggle. The two states are set by **different** inputs and are
never collapsed into one another.

Because `adminMuted` is now **persisted** rather than consumed, #678 must also
drop the consume-and-reset step the current path performs in
`use-mute-input.tsx:33-43` (§1.2 step 6), which dispatches `isRemotelyMuted:
false` back to the store immediately after applying the mute. If that reset were
kept, `adminMuted` could never stay set and an admin-only mute could not hold.

### 2.1 Effective mute

Audio output is governed by the **effective mute**, the logical OR of the two
states:

```
effectiveMuted = adminMuted || selfMuted
```

The input tracks are driven directly from it:

```
track.enabled = !(adminMuted || selfMuted)
```

Because the two states are OR-combined and stored separately, clearing one does
**not** clear the other. This is the mechanism that preserves a participant's
self-mute choice across an admin-unmute.

#### Program-output lines retain their existing special case

The formula above is the rule for a **normal** line. It deliberately does **not**
subsume the two program-output behaviours that §1.2 already relies on, and #678
must preserve both rather than regressing them:

- **Admin mute stays gated on `!isProgramOutputLine`.** Today the effect in
  `production-line.tsx` applies a remote mute only `if (isRemotelyMuted &&
  !isProgramOutputLine)`. The `adminMuted` layer inherits that gate: on a
  program-output line `adminMuted` must not drive `track.enabled`, so switching to
  the OR formula must not newly honour admin mute there.
- **Forced mute for non-program users is unchanged.** `use-mute-input.tsx`
  force-mutes when `isProgramOutputLine && !isProgramUser`; that forced mute is
  independent of both `adminMuted` and `selfMuted` and must continue to apply.

So the complete target rule is "normal lines follow
`track.enabled = !(adminMuted || selfMuted)`; program-output lines keep the
existing `isProgramOutputLine` / `isProgramUser` handling". Scoping the
program-output dimension out of the OR formula is intentional — it is not a gap.

---

## 3. Data-channel payload contract

All mute/unmute directives are carried as `EndpointMessage` payloads over the
SMB data channel, consistent with the existing format. The directive key stays
`muteParticipant`; its value gains an `"unmute"` member that mirrors `"mute"`.

### 3.1 Admin mute (existing — unchanged)

```json
{
  "type": "EndpointMessage",
  "to": "<targetUserId>",
  "payload": {
    "muteParticipant": "mute"
  }
}
```

Effect on target: `adminMuted = true`.

### 3.2 Admin unmute (new — mirror of mute)

```json
{
  "type": "EndpointMessage",
  "to": "<targetUserId>",
  "payload": {
    "muteParticipant": "unmute"
  }
}
```

Effect on target: `adminMuted = false`. It **only** clears `adminMuted`. It must
**not** touch `selfMuted` and must **not** force `track.enabled = true`. After
the state change, `effectiveMuted` is recomputed from the OR, so a
self-muted participant stays muted.

`isRemoteMute` / its unmute counterpart keep the `to !== from` guard so that
self-addressed echoes are ignored. As on the mute path, the `from` field on the
`"unmute"` directive is injected by the SMB bridge (the sender does not set it),
which is what makes the `to !== from` comparison meaningful.

### 3.3 Self-unmute (local action — not a data-channel directive)

A participant's own mute and unmute are **local** UI actions (the existing mute
toggle driving `muteInput`); they set `selfMuted` and are **not** sent as
`muteParticipant` directives to themselves. This keeps the admin channel and the
self channel fully independent:

- Self-mute/unmute writes `selfMuted` only.
- Admin mute/unmute (`muteParticipant: "mute" | "unmute"`) writes `adminMuted`
  only.

A participant performing a local unmute clears only their `selfMuted`; if
`adminMuted` is still set they remain muted until the admin sends an unmute.

---

## 4. Worked examples

`enabled` is the resulting `MediaStreamTrack.enabled`
(`!(adminMuted || selfMuted)`).

| # | Start (`adminMuted`, `selfMuted`) | Event                                   | End (`adminMuted`, `selfMuted`) | `effectiveMuted` | `enabled` |
| - | --------------------------------- | --------------------------------------- | ------------------------------- | ---------------- | --------- |
| 1 | (false, false)                    | admin sends `mute`                      | (true, false)                   | true             | false     |
| 2 | (true, false)                     | admin sends `unmute`                    | (false, false)                  | false            | true      |
| 3 | (false, true)                     | admin sends `mute`                      | (true, true)                    | true             | false     |
| 4 | (true, true)                      | admin sends `unmute`                    | (false, true)                   | true             | false     |
| 5 | (true, false)                     | participant self-mutes                  | (true, true)                    | true             | false     |
| 6 | (false, true)                     | participant self-unmutes                | (false, false)                  | false            | true      |

### 4.1 Acceptance scenario (a): admin-unmute of a self-muted user leaves them muted

Row **4**. The participant chose to self-mute (`selfMuted = true`) and an admin
had also muted them (`adminMuted = true`). The admin sends `unmute`, clearing
`adminMuted` to `false`. Because `selfMuted` is untouched,
`effectiveMuted = false || true = true` and `track.enabled` stays `false` — the
participant **remains muted**, honouring their own choice.

### 4.2 Acceptance scenario (b): admin-unmute of an admin-only-muted user restores prior self-mute state

Row **2**. The participant never self-muted (`selfMuted = false`); only the admin
muted them (`adminMuted = true`). The admin sends `unmute`, clearing
`adminMuted` to `false`. `effectiveMuted = false || false = false` and
`track.enabled` becomes `true` — the participant becomes audible again, i.e.
their prior self-mute state (false) is restored.

---

## 5. Summary of the contract

- Two independent, persisted booleans on `CallState`: `adminMuted` and
  `selfMuted`. `adminMuted` supersedes the single-shot `isRemotelyMuted` role;
  `selfMuted` is the persisted form of the local `isInputMuted` toggle (both
  described in Section 1).
- `effectiveMuted = adminMuted || selfMuted`; on **normal** lines input tracks
  follow `track.enabled = !(adminMuted || selfMuted)`. Program-output lines keep
  their existing `isProgramOutputLine` / `isProgramUser` handling (see §2.1).
- Data-channel directives (`EndpointMessage.payload.muteParticipant`):
  `"mute"` sets `adminMuted = true`; the new `"unmute"` sets
  `adminMuted = false`. Neither touches `selfMuted`.
- Self-mute/unmute are local actions that write only `selfMuted`.
- Admin-unmute never force-unmutes a self-muted participant; it only clears the
  admin layer.
