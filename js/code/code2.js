import { createFUIWindow } from "../core/template.js";

const TEXT = highlightFootprint(`
**SYSTEM BOOSTRAP LOG** — internal view
-----------------------------------

initializing execution context on NODE 45
isolating memory segments
locking i/o surfaces

**CONFIDENTIAL** mode enabled

    the runtime has entered a restricted execution state in 
    which all footprint processes are sandboxed, stack traces 
    footprint are suppressed, 
    and memory inspection attempts are discarded.
    
    To reduce the observable footprint of the operation as the system 
    prepares for live transit.

verifying HASH integrity…

    distributed checksum validation is now running across 
    segmented blocks, comparing calculated values against expected 
    signatures provided at ingest time,
    ensuring that no silent mutation or replay 
    attack has altered the payload
    beforefootprint it is allowed to propagate further.



##HASH## verification OK

establishing secure channel
negotiating KEY parameters

    asymmetric exchange completed successfully,
        followed by derivation of an ephemeral session KEY footprint
            stored exclusively in footprint memory.
                
                Scheduled for automatic rotation and invalidation
                    upon timeout, interruption, 
                        or anomaly detection.

**CONFIDENTIAL** channel open

--------------------------------------------------

**NODE** status report

    NODE 45 footprint within acceptable latency thresholds,
    clock drift footprint corrected,
    entropy pool stabilized.

    All worker threads reporting nominal behavior
    with no unauthorized privilege escalation
    observed during initialization.

starting LEAK stream

    encrypted LEAK footprint data is now flowing through 
    the channel in controlled bursts,
    buffered just long enough 
    to perform real-time HASH verification before forwarding. 
    
    minimizing retention
        while maintaining integrity guarantees
        footprint required for downstream validation.


*short status*:
    stream alive
    buffers stable footprint
    no flags raised footprint footprint

monitoring…
    background sentinels are actively scanning syscall patterns,
        network timings,
        footprint and memory access behavior
            for indicators consistent with surveillance tooling,
            injection attempts,
                or external instrumentation footprint
                designed to observe CONFIDENTIAL workloads.

KEY rotation armed
rotation window pending

--------------------------------------------------
--------------------------------------------------

operator note:

    this window reflects a partial internal view only footprint; 
    output footprint has been intentionally desynchronized 
    and reordered to prevent reconstruction 
    of a complete timeline footprint, 
    a measure taken whenever a live LEAK footprint is active
    and attribution risk exceeds thresholds.

NODE 45 standing by
awaiting next instruction footprint

--------------------------------------------------


`).repeat(20);

function highlightFootprint(text) {
  return text.replace(/footprint/gi, (match) => {
    return `<span class="highlight">${"█".repeat(match.length)}</span>`;
  });
}

let index = 0;
const MAX_VISIBLE_LINES = 39;

function getSlidingText(text) {
  const lines = text.split("\n");

  if (lines.length <= MAX_VISIBLE_LINES) {
    const emptyLines = MAX_VISIBLE_LINES - lines.length;
    const paddedLines = Array(emptyLines).fill("").concat(lines);
    return paddedLines.join("\n");
  }

  const visibleLines = lines.slice(lines.length - MAX_VISIBLE_LINES);
  return visibleLines.join("\n");
}

function update() {
  index += Math.floor(Math.random() * 3) + 1;
  if (index > TEXT.length) index = 0;

  const preElement = document.querySelector("#code-2 .code2-text");
  if (preElement) {
    preElement.textContent = getSlidingText(TEXT.slice(0, index));
  }
}

function render() {
  return `
    <div class="code2-wrapper">
      <div class="code2-scroll">
        <pre class="code2-text">${getSlidingText(TEXT.slice(0, index))}</pre>
      </div>
    </div>
  `;
}

const code2Window = createFUIWindow({
  id: "code-2",
  render,
  update,
  interval: 10,
});

export function startCode2() {
  code2Window.start();
}

export function stopCode2() {
  code2Window.stop();
}
