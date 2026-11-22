/**
 * LabOps (Laboratory Operations) — Logika Interaktif Halaman Denah & Status PC Live
 * Mencakup: Toggle Navigasi, Filter & Pencarian, Counter Live, Drawer Detail, dan Validasi Form.
 */

// 1. Data Awal 30 Unit PC Laboratorium
const labs = ["Lab Komputer 1", "Lab Komputer 2", "Lab Jaringan"];
const softwarePresets = [
  ["VS Code", "Node.js", "Chrome", "Git"],
  ["VS Code", "XAMPP", "Figma Browser", "Python"],
  ["Cisco Packet Tracer", "Wireshark", "PuTTY", "VS Code"],
];

const pcData = Array.from({ length: 30 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const labIndex = Math.floor(index / 10);
  // Distribusi status awal yang realistis
  let status = "tersedia";
  let note = "Kondisi normal, siap digunakan.";

  if ([2, 5, 11, 14, 18, 22, 26].includes(index + 1)) {
    status = "dipakai";
    note = "Sedang digunakan mahasiswa hingga akhir sesi.";
  } else if ([7, 19, 28].includes(index + 1)) {
    status = "rusak";
    note = "Dilaporkan kendala hardware/jaringan, menunggu pengecekan Staff Lab.";
  }

  return {
    id: `PC-${number}`,
    lab: labs[labIndex],
    spec: labIndex === 2 ? "Win 11 Pro • Core i7 • 16GB RAM" : "Win 11 Pro • Core i5 • 8GB RAM",
    software: softwarePresets[labIndex],
    status,
    note,
  };
});

// State Filter & Pilihan Aktif
const state = {
  search: "",
  lab: "all",
  status: "all",
  selectedPcId: null,
};

// Referensi Elemen DOM
const sidebar = document.getElementById("sidebar");
const mainWrapper = document.querySelector(".main-wrapper");
const backdrop = document.getElementById("backdrop");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const btnCloseSidebar = document.getElementById("btn-close-sidebar");

const searchInput = document.getElementById("search-pc");
const labSelect = document.getElementById("filter-lab");
const statusPills = document.querySelectorAll(".pill");
const pcGrid = document.getElementById("pc-grid");

const countTotal = document.getElementById("count-total");
const countAvailable = document.getElementById("count-available");
const countOccupied = document.getElementById("count-occupied");
const countBroken = document.getElementById("count-broken");

const pcDrawer = document.getElementById("pc-drawer");
const btnCloseDrawer = document.getElementById("btn-close-drawer");
const btnOpenBooking = document.getElementById("btn-open-booking");
const btnOpenReport = document.getElementById("btn-open-report");
const btnQuickReport = document.getElementById("btn-quick-report");

const actionModal = document.getElementById("action-modal");
const labopsForm = document.getElementById("labops-form");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const formModeInput = document.getElementById("form-mode");
const formPcSelect = document.getElementById("form-pc-select");
const formNimInput = document.getElementById("form-nim");
const formSlotSelect = document.getElementById("form-slot");
const formCategorySelect = document.getElementById("form-category");
const formDescriptionInput = document.getElementById("form-description");
const bookingFields = document.getElementById("booking-fields");
const reportFields = document.getElementById("report-fields");
const modalTitle = document.getElementById("modal-title");
const btnSubmitForm = document.getElementById("btn-submit-form");

const toastEl = document.getElementById("toast");

/* ==========================================================================
   Helper: Label Status & Notifikasi Toast
   ========================================================================== */
function getStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dipakai: "Dipakai",
    rusak: "Rusak",
  };
  return labels[status] || status;
}

let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}

/* ==========================================================================
   Komponen 1: Toggle Sidebar Responsif & Active Nav
   ========================================================================== */
function toggleSidebar() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    const collapsed = sidebar.classList.toggle("collapsed");
    mainWrapper.classList.toggle("expanded", collapsed);
    btnToggleSidebar.setAttribute("aria-expanded", String(!collapsed));
  } else {
    const isOpen = sidebar.classList.toggle("mobile-open");
    backdrop.classList.toggle("show", isOpen);
    btnToggleSidebar.setAttribute("aria-expanded", String(isOpen));
  }
}

function closeOverlays() {
  sidebar.classList.remove("mobile-open");
  pcDrawer.classList.remove("open");
  pcDrawer.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("show");
}

btnToggleSidebar.addEventListener("click", toggleSidebar);
btnCloseSidebar.addEventListener("click", closeOverlays);
backdrop.addEventListener("click", closeOverlays);

// Sinkronisasi status aktif pada Sidebar & Bottom Navigation
document.querySelectorAll("[data-nav]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = event.currentTarget.dataset.nav;
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("active", el.dataset.nav === target);
    });
    if (target === "lapor") {
      event.preventDefault();
      openActionModal("lapor", pcData[0].id);
    } else if (target === "booking") {
      event.preventDefault();
      const firstAvailable = pcData.find((pc) => pc.status === "tersedia");
      openActionModal("booking", firstAvailable ? firstAvailable.id : pcData[0].id);
    } else if (target === "profil") {
      event.preventDefault();
      showToast("Login aktif sebagai Mahasiswa (Mode Demo).");
    }
    if (window.innerWidth < 1024) closeOverlays();
  });
});

/* ==========================================================================
   Komponen 2 & 3: Filter, Pencarian, Counter Live, dan Render Grid PC
   ========================================================================== */
function getFilteredPcs() {
  return pcData.filter((pc) => {
    const matchesLab = state.lab === "all" || pc.lab === state.lab;
    const matchesStatus = state.status === "all" || pc.status === state.status;
    const keyword = state.search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      pc.id.toLowerCase().includes(keyword) ||
      pc.spec.toLowerCase().includes(keyword) ||
      pc.software.some((sw) => sw.toLowerCase().includes(keyword));
    return matchesLab && matchesStatus && matchesSearch;
  });
}

function updateCounters(list) {
  countTotal.textContent = list.length;
  countAvailable.textContent = list.filter((p) => p.status === "tersedia").length;
  countOccupied.textContent = list.filter((p) => p.status === "dipakai").length;
  countBroken.textContent = list.filter((p) => p.status === "rusak").length;
}

function renderPcGrid() {
  const filtered = getFilteredPcs();
  updateCounters(filtered);
  pcGrid.innerHTML = "";

  if (filtered.length === 0) {
    pcGrid.innerHTML = `<p class="empty-state">Tidak ada unit PC yang cocok dengan filter pencarian.</p>`;
    return;
  }

  filtered.forEach((pc) => {
    const card = document.createElement("article");
    card.className = "pc-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${pc.id}, ${pc.lab}, status ${getStatusLabel(pc.status)}`);

    card.innerHTML = `
      <div class="pc-card-top">
        <span class="pc-code">${pc.id}</span>
        <span class="dot dot-${pc.status === "tersedia" ? "available" : pc.status === "dipakai" ? "occupied" : "broken"}"></span>
      </div>
      <span class="status-badge badge-${pc.status}">${getStatusLabel(pc.status)}</span>
      <p class="pc-lab">${pc.lab}</p>
      <p class="pc-spec">${pc.spec.split("•")[1].trim()}</p>
    `;

    card.addEventListener("click", () => openPcDrawer(pc.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPcDrawer(pc.id);
      }
    });

    pcGrid.appendChild(card);
  });
}

// Event Listener Filter
searchInput.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderPcGrid();
});

labSelect.addEventListener("change", (e) => {
  state.lab = e.target.value;
  renderPcGrid();
});

statusPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    statusPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    state.status = pill.dataset.status;
    renderPcGrid();
  });
});

/* ==========================================================================
   Komponen 4: Drawer Detail PC
   ========================================================================== */
function openPcDrawer(pcId) {
  const pc = pcData.find((item) => item.id === pcId);
  if (!pc) return;

  state.selectedPcId = pc.id;
  document.getElementById("drawer-pc-id").textContent = pc.id;
  document.getElementById("drawer-pc-lab").textContent = pc.lab;
  document.getElementById("drawer-pc-spec").textContent = pc.spec;
  document.getElementById("drawer-pc-note").textContent = pc.note;

  const badge = document.getElementById("drawer-pc-status");
  badge.className = `status-badge badge-${pc.status}`;
  badge.textContent = getStatusLabel(pc.status);

  const softwareList = document.getElementById("drawer-pc-software");
  softwareList.innerHTML = pc.software
    .map((sw) => `<li class="tag-item">${sw}</li>`)
    .join("");

  // Nonaktifkan tombol booking jika PC sedang dipakai atau rusak
  btnOpenBooking.disabled = pc.status !== "tersedia";
  btnOpenBooking.textContent =
    pc.status === "tersedia" ? "Booking PC Ini" : `Tidak Tersedia (${getStatusLabel(pc.status)})`;

  pcDrawer.classList.add("open");
  pcDrawer.setAttribute("aria-hidden", "false");
  backdrop.classList.add("show");
}

btnCloseDrawer.addEventListener("click", closeOverlays);
btnOpenBooking.addEventListener("click", () => {
  closeOverlays();
  openActionModal("booking", state.selectedPcId);
});
btnOpenReport.addEventListener("click", () => {
  closeOverlays();
  openActionModal("lapor", state.selectedPcId);
});
btnQuickReport.addEventListener("click", () => openActionModal("lapor", pcData[0].id));

/* ==========================================================================
   Komponen 5: Modal Form Booking & Lapor Kerusakan + Validasi
   ========================================================================== */
function populatePcOptions(selectedId) {
  formPcSelect.innerHTML = pcData
    .map(
      (pc) =>
        `<option value="${pc.id}" ${pc.id === selectedId ? "selected" : ""}>${pc.id} — ${pc.lab} (${getStatusLabel(pc.status)})</option>`
    )
    .join("");
}

function clearFormErrors() {
  document.getElementById("error-nim").textContent = "";
  document.getElementById("error-slot").textContent = "";
  document.getElementById("error-description").textContent = "";
}

function openActionModal(mode, pcId) {
  clearFormErrors();
  labopsForm.reset();
  formModeInput.value = mode;
  populatePcOptions(pcId);

  if (mode === "booking") {
    modalTitle.textContent = "Booking Komputer Lab";
    btnSubmitForm.textContent = "Konfirmasi Booking";
    bookingFields.hidden = false;
    reportFields.hidden = true;
  } else {
    modalTitle.textContent = "Lapor Kerusakan PC";
    btnSubmitForm.textContent = "Kirim Laporan";
    bookingFields.hidden = true;
    reportFields.hidden = false;
  }

  actionModal.showModal();
}

function closeActionModal() {
  actionModal.close();
}

btnCloseModal.addEventListener("click", closeActionModal);
btnCancelModal.addEventListener("click", closeActionModal);

// Validasi & Submit Form
function validateAndSubmitForm(event) {
  event.preventDefault();
  clearFormErrors();

  const mode = formModeInput.value;
  const pcId = formPcSelect.value;
  const nim = formNimInput.value.trim();
  const targetPc = pcData.find((p) => p.id === pcId);
  let isValid = true;

  // Validasi NIM (hanya angka, minimal 8 digit)
  if (!/^\d{8,}$/.test(nim)) {
    document.getElementById("error-nim").textContent = "NIM wajib berupa angka minimal 8 digit.";
    isValid = false;
  }

  if (mode === "booking") {
    const slot = formSlotSelect.value;
    if (!slot) {
      document.getElementById("error-slot").textContent = "Pilih slot waktu pemakaian terlebih dahulu.";
      isValid = false;
    } else if (targetPc && targetPc.status !== "tersedia") {
      document.getElementById("error-slot").textContent = `${pcId} sedang tidak tersedia untuk dibooking.`;
      isValid = false;
    }

    if (isValid && targetPc) {
      targetPc.status = "dipakai";
      targetPc.note = `Dibooking oleh NIM ${nim} untuk sesi ${slot} WIB.`;
      renderPcGrid();
      closeActionModal();
      showToast(`Booking ${pcId} (${slot}) berhasil dikonfirmasi.`);
    }
  } else {
    const desc = formDescriptionInput.value.trim();
    const category = formCategorySelect.value;
    if (desc.length < 10) {
      document.getElementById("error-description").textContent =
        "Deskripsi kendala minimal 10 karakter agar mudah ditangani Staff Lab.";
      isValid = false;
    }

    if (isValid && targetPc) {
      targetPc.status = "rusak";
      targetPc.note = `[${category}] ${desc} (Dilaporkan oleh NIM ${nim}).`;
      renderPcGrid();
      closeActionModal();
      showToast(`Laporan kerusakan ${pcId} berhasil dikirim ke Staff Lab.`);
    }
  }
}

labopsForm.addEventListener("submit", validateAndSubmitForm);

// Inisialisasi Awal
renderPcGrid();
