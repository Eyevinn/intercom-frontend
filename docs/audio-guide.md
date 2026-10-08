# Audio Guide: External Audio Sources and Equipment

This guide explains how to configure an external audio source and external
equipment (microphones, headsets, speakers, hardware/software encoders) with the
Eyevinn Open Intercom client. Every step below reflects behaviour that the
client currently implements — nothing here is aspirational.

There are three ways to bring external audio in and out of a production:

1. **Local input/output devices** — pick which microphone and speaker/headset
   the browser uses for a call.
2. **WHIP / WHEP endpoints** — connect external hardware or software encoders
   straight to a line over WebRTC, without the browser UI.
3. **Audio Feed lines** — dedicate a line to a one-way program/audio source that
   listeners can only hear.

---

## 1. Granting microphone access

The client needs microphone permission before it can list any audio equipment.
On entering the app it calls `getUserMedia({ audio: true })`; accept the
browser prompt. If you deny access, no input devices can be enumerated and the
input selector falls back to **No device available**.

Device discovery uses the browser's `enumerateDevices`, so only equipment the
operating system and browser already expose is listed. Plug in your external
equipment (USB audio interface, headset, mixer, etc.) **before** selecting
devices, or use the reload control described below after connecting it.

---

## 2. Selecting input and output devices

Audio devices are configured through the **Devices** section, which appears in
two places with the same controls:

- **When joining a production** — in the join form, below **Username**.
- **While in a call** — in the per-call device form, so you can switch
  equipment without leaving the call.

### Input (microphone)

The **Input** dropdown lists every detected microphone / audio input by its
label. The client defaults to the device reported as `default` by the operating
system, or the first available input if there is no explicit default. Selecting
a different input is how you route an external microphone or audio interface
into the intercom.

### Output (speaker / headset)

The **Output** dropdown lists detected audio outputs and sets the playback sink
for the call's audio elements. Note the following, which the client enforces:

- **Safari** does not expose output-device selection at all; the section is
  labelled **Device** (singular) and only the input selector is shown. On
  Safari, the operating system controls output routing.
- If no selectable outputs are reported, the client shows
  **"Controlled by operating system"** instead of a dropdown — change the output
  in your OS sound settings in that case.

### Applying changes during a call

In the in-call device form, press **Save** to apply a change. The client
optimises what it does based on what you changed:

- **Output only changed** — the new sink is applied immediately to the playing
  audio (via `setSinkId`); the call is _not_ renegotiated.
- **Input changed** (with or without an output change) — the call reconnects
  with the newly selected microphone.

The **Save** button stays disabled until you actually change a device, so
re-saving the same selection is not possible.

### Reloading the device list

If you connect external equipment after the device list was built, use the
**Reload devices** control (the circular refresh icon next to the Devices
heading / in the in-call device form) to re-enumerate without reloading the
page.

Firefox exception: on desktop Firefox the browser does not re-enumerate devices
on demand. The reload control is hidden there, and if triggered it shows a
notice that Firefox needs the microphone permission to be reset manually — in
practice you must remove the permission and reload the page to pick up newly
connected equipment.

---

## 3. Connecting external equipment over WHIP / WHEP

For external hardware or software that speaks WebRTC directly (for example a
hardware WHIP encoder or an encoder application) you do not need the browser
device pickers at all. Each line exposes WHIP and WHEP endpoints:

- **WHIP** — ingest: push an external audio source _into_ the line.
- **WHEP** — egress: pull the line's audio _out_ to external equipment.

### Getting the URLs

1. Open a call/line and click the **⋮ (More options)** menu in the line header.
2. Choose **WebRTC**.
3. Enter a **username** to identify the external connection. The WHIP and WHEP
   copy buttons stay disabled until a username is entered.
4. Click **Copy WHIP link** or **Copy WHEP link** and paste it into your
   external encoder/decoder configuration.

### URL format

The client builds the URLs from the configured backend (manager) URL and API
version:

```
<backend-url>/<api-version>/whip/<productionId>/<lineId>/<username>
<backend-url>/<api-version>/whep/<productionId>/<lineId>/<username>
```

The API version defaults to `api/v1/` (`VITE_BACKEND_API_VERSION`), and the
backend base URL is resolved at runtime from the deployment configuration
(`MANAGER_URL` / `VITE_BACKEND_URL`; see the main README for how these are set).

The client only generates these URLs — the actual encoder/decoder settings
(codec, bitrate, etc.) are configured on the external equipment itself. Once an
external source is connected via WHIP, it appears as a participant in the line's
user list marked with a WHIP icon.

---

## 4. Audio Feed lines (one-way program sources)

When an external source should be heard by everyone on a line but should not be
talked over — for example a program feed or a pre-produced audio source — use an
**Audio Feed** line.

### Creating one

In the **Create production** form, each line has an **Audio Feed** checkbox.
As the in-app tooltip states: _"In an Audio Feed line, listeners are not able to
talk. Only the Audio Feed will be heard."_

### Joining one

When you join a line that is configured as an Audio Feed, the client asks how
you want to connect:

- **Listener** — you only hear the feed.
- **Audio feed** — you are the source that everyone on the line hears.

Pick **Audio feed** to route your selected input device (or a WHIP source) in as
the program source; pick **Listener** to monitor it.

---

## Quick reference

| Goal                                       | Where                                                     |
| ------------------------------------------ | --------------------------------------------------------- |
| Choose microphone                          | **Devices → Input** (join form or in-call)                |
| Choose speaker/headset                     | **Devices → Output** (hidden on Safari)                   |
| Apply new output instantly                 | Change **Output** only, then **Save**                     |
| Switch microphone mid-call                 | Change **Input**, then **Save** (reconnects)              |
| Pick up newly plugged-in equipment         | **Reload devices** (refresh icon); reload page on Firefox |
| Connect an external WebRTC encoder/decoder | Line **⋮ → WebRTC** → copy **WHIP** (in) / **WHEP** (out) |
| Feed a one-way program source              | Create an **Audio Feed** line; join as **Audio feed**     |

---

## Troubleshooting

- **No microphones listed / "No device available"** — microphone permission was
  denied, or no input is connected. Grant permission and use **Reload devices**.
- **No output dropdown, only "Controlled by operating system"** — the browser
  reported no selectable outputs; change the output in your OS settings. On
  Safari this is expected behaviour.
- **Newly connected equipment not showing** — use **Reload devices**; on desktop
  Firefox reset the microphone permission and reload the page.
- **WHIP/WHEP copy buttons disabled** — enter a username first.
</content>

</invoke>
