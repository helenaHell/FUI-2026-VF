import { createFUIWindow } from "../core/template.js";

// =====================
// DOCUMENTS DATABASE
// =====================

const DOCUMENTS = [
  {
    id: "DOC-2024-001",
    name: "PRISM_Surveillance_Program.pdf",
    classification: "TOP SECRET",
    date: "2024-01-03",
    size: "2.4 MB",
    hash: "a3f8e9c2d1b4567890abcdef12345678",
    status: "ENCRYPTED",
    tags: ["NSA", "SURVEILLANCE", "PRISM"],
    source: "WHISTLEBLOWER-A",
  },
  {
    id: "DOC-2024-002",
    name: "CIA_BlackSites_Report.docx",
    classification: "CLASSIFIED",
    date: "2024-01-05",
    size: "1.8 MB",
    hash: "b7d4c3a2e1f5678901bcdef234567890",
    status: "DECRYPTED",
    tags: ["CIA", "DETENTION", "HUMAN RIGHTS"],
    source: "ANONYMOUS",
  },
  {
    id: "DOC-2024-003",
    name: "Corporate_Tax_Evasion_Scheme.xlsx",
    classification: "CONFIDENTIAL",
    date: "2024-01-08",
    size: "890 KB",
    hash: "c9e5d4b3f2a6789012cdef345678901a",
    status: "VERIFIED",
    tags: ["FINANCE", "TAX EVASION", "OFFSHORE"],
    source: "INSIDER",
  },
  {
    id: "DOC-2024-004",
    name: "Drone_Strike_Authorization.pdf",
    classification: "SECRET",
    date: "2024-01-10",
    size: "3.2 MB",
    hash: "d1f6e5c4a3b7890123def456789012bc",
    status: "PENDING REVIEW",
    tags: ["MILITARY", "DRONE", "AUTHORIZATION"],
    source: "LEAKED",
  },
  {
    id: "DOC-2024-005",
    name: "Election_Interference_Evidence.zip",
    classification: "TOP SECRET",
    date: "2024-01-12",
    size: "5.6 MB",
    hash: "e2a7f6d5b4c8901234ef567890123cd",
    status: "ENCRYPTED",
    tags: ["ELECTION", "INTERFERENCE", "EVIDENCE"],
    source: "WHISTLEBLOWER-B",
  },
];

// =====================
// STATE
// =====================

let selectedIndex = 0;

// =====================
// RENDER FUNCTIONS
// =====================

function renderHeader() {
  return `
    <div class="docs-header">
      <span class="docs-title">DOCUMENT REGISTRY</span>
      <span class="docs-count">${DOCUMENTS.length} FILES</span>
    </div>
    <div class="docs-separator"></div>
  `;
}

function renderDocumentList() {
  return `
    <div class="docs-list">
      ${DOCUMENTS.map(
        (doc, i) => `
        <div class="docs-list-item ${i === selectedIndex ? "selected" : ""}" data-index="${i}">
          <span class="docs-list-id">${doc.id}</span>
          <span class="docs-list-name">${doc.name}</span>
          <span class="docs-list-status ${doc.status.toLowerCase().replace(/\s/g, "-")}">${doc.status}</span>
        </div>
      `
      ).join("")}
    </div>
  `;
}

function renderDocumentDetails() {
  const doc = DOCUMENTS[selectedIndex];
  if (!doc) return "";

  return `
    <div class="docs-details">
      <div class="docs-detail-section">
        <div class="docs-detail-label">CLASSIFICATION:</div>
        <div class="docs-detail-value ${doc.classification.toLowerCase().replace(/\s/g, "-")}">${doc.classification}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">DOCUMENT ID:</div>
        <div class="docs-detail-value">${doc.id}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">FILENAME:</div>
        <div class="docs-detail-value">${doc.name}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">DATE:</div>
        <div class="docs-detail-value">${doc.date}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">SIZE:</div>
        <div class="docs-detail-value">${doc.size}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">SHA-256 HASH:</div>
        <div class="docs-detail-value docs-hash">${doc.hash}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">STATUS:</div>
        <div class="docs-detail-value ${doc.status.toLowerCase().replace(/\s/g, "-")}">${doc.status}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">SOURCE:</div>
        <div class="docs-detail-value">${doc.source}</div>
      </div>

      <div class="docs-detail-section">
        <div class="docs-detail-label">TAGS:</div>
        <div class="docs-detail-tags">
          ${doc.tags.map((tag) => `<span class="docs-tag">${tag}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="docs-footer">
      <div class="docs-separator"></div>
      <div class="docs-footer-content">
        <span>[ESC] Exit  [↑↓] Navigate  [ENTER] Open</span>
        <span>REGISTRY v2.4.1</span>
      </div>
    </div>
  `;
}

function render() {
  return `
    <div class="docs-container">
      ${renderHeader()}
      <div class="docs-main">
        ${renderDocumentList()}
        ${renderDocumentDetails()}
      </div>
      ${renderFooter()}
    </div>
  `;
}

// =====================
// UPDATE & EVENTS
// =====================

function update() {
  setTimeout(attachEvents, 10);
}

function attachEvents() {
  // Click sur un document
  document.querySelectorAll("#dist-docs .docs-list-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedIndex = parseInt(item.dataset.index, 10);
      docsWindow.start(); // Force re-render
    });
  });
}

// =====================
// FUI WINDOW INSTANCE
// =====================

export const docsWindow = createFUIWindow({
  id: "dist-docs",
  render,
  update,
  interval: null, // Pas d'interval, static content
  defaultMode: "default",
});

// =====================
// PUBLIC API
// =====================

export function startDISTDocs() {
  docsWindow.start();
}

export function stopDISTDocs() {
  docsWindow.stop();
}