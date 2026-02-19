# Agent Playbook: Autonomous Real-World Purchases via ADB + Bazos.cz

**Date:** 2026-02-19
**Bead:** beads-hub-sl1
**GitHub Issue:** [#31](https://github.com/brenner-axiom/beads-hub/issues/31)
**Status:** Proven in production (DDR4 RAM purchase, 2026-02-19)

---

## 1. Overview

This playbook documents how an AI agent can autonomously complete a real-world purchase on [Bazos.cz](https://bazos.cz) (Czech classifieds platform) using:

- **Browser automation** for web interactions (phone reveal, verification)
- **ADB (Android Debug Bridge)** for SMS read/write on a paired Android device
- **Agent reasoning** for negotiation, logistics lookup, and payment generation

**End-to-end flow time:** ~40 minutes (including seller response wait times)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────┐
│                   AI Agent                       │
│  (OpenClaw / Claude / any LLM orchestrator)     │
├─────────────┬───────────────┬───────────────────┤
│  Browser    │  ADB Bridge   │  Web Fetch        │
│  Control    │  (USB/TCP)    │  (HTTP client)    │
│             │               │                   │
│  bazos.cz   │  Samsung SMS  │  zasilkovna.cz    │
│  subdomain  │  app via UI   │  pickup points    │
│  navigation │  automation   │  bank QR gen      │
└─────────────┴───────────────┴───────────────────┘
        │              │               │
   Phone reveal   Read/Send SMS   Logistics &
   Verification   Negotiation     Payment
```

### Components

| Component | Role | Interface |
|-----------|------|-----------|
| **Browser** | Navigate Bazos listings, trigger phone reveal, enter verification codes | JS evaluation via browser control |
| **ADB** | Read incoming SMS, compose and send outgoing SMS | `adb shell` commands (uiautomator, input, am) |
| **Web Fetch** | Look up shipping/pickup info (Zásilkovna), generate payment QR | HTTP GET + parse |
| **Agent LLM** | Orchestrate flow, negotiate with seller, make decisions | Prompt-based reasoning |
| **Human** | Approve payment (final confirmation gate) | QR code presented for manual bank transfer |

---

## 3. Complete Purchase Flow

### Phase 1: Get Seller Phone Number

1. **Navigate** to listing on correct subdomain (e.g., `pc.bazos.cz`)
2. **Trigger phone reveal:** `document.querySelector('.teldetail').click()`
3. **Enter agent phone number** in overlay and submit
4. **Read verification SMS** via ADB UI dump (see §4)
5. **Enter verification code** in overlay → receive seller phone number

### Phase 2: Initial Contact (SMS)

6. **Compose SMS** via ADB to seller number
7. **Send inquiry** — express interest, ask about shipping/availability
8. **Monitor** for seller reply via ADB UI dumps

### Phase 3: Negotiation

9. **Read seller reply** — parse shipping terms, price confirmation
10. **Send follow-up** — confirm price, request bank details and shipping info
11. **Handle seller questions** — provide name, email, pickup point as needed

### Phase 4: Logistics

12. **Look up pickup point** (e.g., Zásilkovna) via web fetch
13. **Send logistics details** to seller via SMS

### Phase 5: Payment

14. **Receive bank account** from seller (Czech format: `XXXXXXXXXX/BBBB`)
15. **Convert to IBAN** and generate SPD payment QR code
16. **Present QR to human** for approval and payment ← **HUMAN GATE**
17. **Send payment confirmation SMS** to seller after human confirms

---

## 4. ADB Interaction Patterns

### 4.1 Reading SMS (UI Dump Method)

Samsung devices block `content://sms` queries and SQLite access without root. The reliable method is UI automation:

```bash
# Dump current UI state
adb -s $DEVICE shell uiautomator dump /sdcard/ui.xml
adb -s $DEVICE pull /sdcard/ui.xml /tmp/ui.xml

# Extract all visible text
grep -o 'text="[^"]*"' /tmp/ui.xml | grep -v 'text=""'
```

**To navigate to a specific SMS thread:**
1. Open Messages app: `adb -s $DEVICE shell am start -n com.samsung.android.messaging/.ui.ConversationListActivity`
2. Dump UI to find the target thread row
3. Calculate tap coordinates from `bounds` attribute (center of bounding box)
4. Tap: `adb -s $DEVICE shell input tap X Y`

### 4.2 Sending SMS

```bash
# ALWAYS force-stop first to get clean compose window
adb -s $DEVICE shell am force-stop com.samsung.android.messaging
sleep 1

# Open fresh compose to target number
adb -s $DEVICE shell 'am start -a android.intent.action.SENDTO -d "smsto:+420XXXXXXXXX"'
sleep 2

# Type word-by-word (spaces are eaten by `input text`)
for word in "Hello," "I" "am" "interested."; do
  adb -s $DEVICE shell input text "$word"
  adb -s $DEVICE shell input keyevent KEYCODE_SPACE
done

# Dismiss keyboard BEFORE tapping Send
adb -s $DEVICE shell input keyevent KEYCODE_BACK
sleep 1

# Find Send button via UI dump, tap its bounds center
adb -s $DEVICE shell uiautomator dump /sdcard/ui.xml
# Parse for content-desc="Send", extract bounds, tap center
adb -s $DEVICE shell input tap $SEND_X $SEND_Y
```

### 4.3 Verifying Send Success

```bash
adb -s $DEVICE shell uiautomator dump /sdcard/ui.xml
# Check compose field — empty means sent
grep 'editor_body' /tmp/ui.xml | grep -o 'text="[^"]*"'
# text="" → success | text="..." → still in compose, retry
```

### 4.4 Coordinate Systems — Critical

- **UI dump `bounds`** = touch coordinate space ← **USE THESE**
- **Screenshot pixels** ≠ touch coordinates on Samsung
- Check touch space: `adb shell wm size` (e.g., `1080x1920`)
- **Never** derive tap coordinates from screenshot pixel positions

---

## 5. Bazos.cz Platform Specifics

### Subdomain Scoping
- Verification is **per-subdomain** — verifying on `www.bazos.cz` does NOT work for `pc.bazos.cz`
- Always verify on the **same subdomain** as the listing
- Codes expire quickly — complete the flow without navigating away

### Phone Reveal DOM Selectors
```javascript
// Trigger overlay
document.querySelector('.teldetail').click()

// Enter phone/code
document.querySelector('#overlaytel input[type=text]').value = 'VALUE'
document.querySelector('#overlaytel button').click()

// Read result
document.querySelector('#overlaytel').innerText
```

---

## 6. Czech Payment QR Generation

Czech banks use the **SPD (Short Payment Descriptor)** format.

### Account Number → IBAN Conversion

```python
def czech_account_to_iban(account: str, bank_code: str, prefix: str = '000000') -> str:
    padded = prefix.zfill(6) + account.zfill(10)
    bban = bank_code + padded
    rearranged = bban + '1235' + '00'  # CZ = 12,35
    check = 98 - (int(rearranged) % 97)
    return f'CZ{check:02d}{bban}'
```

### SPD QR String

```
SPD*1.0*ACC:CZ{IBAN}*AM:{AMOUNT}*CC:CZK*MSG:{MESSAGE}
```

Generate a QR code from this string and present to the human for scanning with their banking app.

---

## 7. Security Considerations

### 7.1 Human-in-the-Loop Gates

| Gate | When | Why |
|------|------|-----|
| **Payment approval** | Before any money transfer | Agent MUST NOT autonomously pay |
| **Personal data sharing** | Before sending name/address/email | Privacy protection |
| **Price threshold** | If negotiated price exceeds budget | Financial guardrail |

### 7.2 ADB Security

- **Device authentication:** ADB requires prior USB debugging authorization (device-level trust)
- **Network exposure:** Use USB connection, NOT `adb tcpip` over network (exposes device to LAN)
- **Scope limitation:** Agent should only interact with SMS app — no contacts, no file access, no app installs
- **Credential isolation:** Agent phone number is separate from human's personal number

### 7.3 Data Handling

- **No persistent storage** of seller phone numbers or bank details after transaction completes
- **SMS content** should be processed in-memory, not logged to disk
- **Redact** phone numbers and account numbers in any logs or memory files

### 7.4 Anti-Abuse

- **Rate limiting:** Max 1 SMS per 30 seconds to avoid carrier spam flags
- **Verification cooldown:** Bazos may throttle repeated phone verifications — respect delays
- **No automated bulk purchasing** — this playbook is for single, intentional purchases

---

## 8. Known Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| `input text` drops spaces | Garbled messages | Word-by-word + `KEYCODE_SPACE` |
| Keyboard obscures Send button | Silent tap failure | `KEYCODE_BACK` before tapping Send |
| Stale compose window | Text appended to old message | Always `am force-stop` before composing |
| Wrong subdomain verification | Code rejected | Verify on listing's subdomain |
| Screenshot coords ≠ touch coords | Tap misses target | Always use UI dump bounds |
| Script killed mid-send | Duplicate on retry | Verify compose field empty after each attempt |
| SMS content provider blocked | Can't read SMS programmatically | Use UI dump method instead |

---

## 9. Proof-of-Concept Outline

A minimal PoC consists of three scripts:

### `bazos_phone_reveal.py`
- Input: Bazos listing URL, agent phone number, ADB device ID
- Flow: Browser → trigger overlay → enter phone → read SMS via ADB → enter code → return seller phone
- Output: Seller phone number

### `adb_sms.sh`
- Functions: `send_sms(device, number, message)`, `read_thread(device, contact_name)`
- Handles: force-stop, word-by-word typing, keyboard dismiss, send verification

### `purchase_orchestrator.py`
- Input: Listing URL, budget, shipping preference
- Orchestrates: phone reveal → SMS negotiation loop → logistics lookup → payment QR generation
- Human gate: Presents QR, waits for confirmation before sending payment confirmation SMS

---

## 10. Future Improvements

- **OCR fallback:** Screenshot + OCR when UI dump fails to capture dynamic content
- **Multi-device support:** Route SMS through different devices based on carrier/region
- **Conversation memory:** Track multi-turn negotiations across sessions
- **Auto-retry with backoff:** Handle transient ADB connection drops
- **Platform expansion:** Adapt patterns for other Czech classifieds (Sbazar, Facebook Marketplace)

---

*This playbook is based on a successful real-world purchase completed on 2026-02-19. All techniques were validated against a Samsung device running Samsung Messages.*
