let allTransactions = [];
let allCategories = [];
let currentEditingId = null;

document.addEventListener("DOMContentLoaded", () => {
  initTransactions();
});

async function initTransactions() {
  await fetchCategories();
  await fetchTransactions();
}

async function fetchCategories() {
  try {
    const response = await fetch("/categories");
    if (response.ok) {
      allCategories = await response.json();
      populateCategoryDropdowns();
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
}

function populateCategoryDropdowns() {
  // Populate form select
  const formSelect = document.getElementById("txCategory");
  if (formSelect) {
    formSelect.innerHTML = `
            <option value="">-- No Category --</option>
            ${allCategories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
        `;
  }

  // Populate filter select
  const filterSelect = document.getElementById("filterCategory");
  if (filterSelect) {
    filterSelect.innerHTML = `
            <option value="">All Categories</option>
            ${allCategories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
        `;
  }
}

async function fetchTransactions() {
  try {
    const response = await fetch("/transactions");
    if (response.status === 401) {
      window.location.href = "/pages/login.html";
      return;
    }

    allTransactions = await response.json();
    applyFilters();
  } catch (err) {
    console.error(err);
    showToast("Error loading transactions", "danger");
  }
}

function applyFilters() {
  const searchQuery =
    document.getElementById("searchDescription")?.value.toLowerCase() || "";
  const filterType = document.getElementById("filterType")?.value || "";
  const filterCatId = document.getElementById("filterCategory")?.value || "";

  let filtered = allTransactions;

  if (searchQuery) {
    filtered = filtered.filter(
      (t) => t.description && t.description.toLowerCase().includes(searchQuery),
    );
  }

  if (filterType) {
    filtered = filtered.filter((t) => t.type === filterType);
  }

  if (filterCatId) {
    filtered = filtered.filter((t) => t.category_id == filterCatId);
  }

  renderTransactions(filtered);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderTransactions(transactions) {
  const listEl = document.getElementById("transactionList");
  if (!listEl) return;

  if (!transactions.length) {
    listEl.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No matching transactions found.</td>
            </tr>
        `;
    return;
  }

  listEl.innerHTML = transactions
    .map((t) => {
      const date = new Date(t.transaction_date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const badgeClass = t.type === "income" ? "badge-income" : "badge-expense";
      const sign = t.type === "income" ? "+" : "-";
      const amountClass = t.type === "income" ? "text-success" : "text-danger";

      return `
            <tr>
                <td>${date}</td>
                <td>
                    <span class="badge-premium ${badgeClass}">${t.type.toUpperCase()}</span>
                </td>
                <td>
                    <span class="badge-premium badge-category">${t.category_name || "Uncategorized"}</span>
                </td>
                <td class="text-muted">${t.description || "-"}</td>
                <td class="font-semibold ${amountClass}">${sign} ${formatCurrency(t.amount)}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button onclick="openEditModal(${t.id})" class="btn-premium btn-premium-secondary btn-sm py-1 px-2 text-xs">
                            Edit
                        </button>
                        <button onclick="deleteTransaction(${t.id})" class="btn-premium btn-premium-danger btn-sm py-1 px-2 text-xs">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function openAddModal() {
  currentEditingId = null;
  document.getElementById("modalTitle").textContent = "Add Transaction";

  document.getElementById("txType").value = "expense";
  document.getElementById("txAmount").value = "";
  document.getElementById("txCategory").value = "";
  document.getElementById("txDescription").value = "";

  // Set default date to today in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("txDate").value = today;

  document.getElementById("transactionModal").classList.add("active");
}

async function openEditModal(id) {
  currentEditingId = id;
  document.getElementById("modalTitle").textContent = "Edit Transaction";

  try {
    // Fetch details from our new detail endpoint!
    const response = await fetch(`/transactions/${id}`);
    if (!response.ok) {
      showToast("Failed to fetch transaction details", "danger");
      return;
    }

    const data = await response.json();

    document.getElementById("txType").value = data.type;
    document.getElementById("txAmount").value = data.amount;
    document.getElementById("txCategory").value = data.category_id || "";
    document.getElementById("txDescription").value = data.description || "";

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(data.transaction_date)
      .toISOString()
      .split("T")[0];
    document.getElementById("txDate").value = formattedDate;

    document.getElementById("transactionModal").classList.add("active");
  } catch (err) {
    console.error(err);
    showToast("Error fetching transaction detail", "danger");
  }
}

function closeModal() {
  document.getElementById("transactionModal").classList.remove("active");
}

async function saveTransaction() {
  const type = document.getElementById("txType").value;
  const amount = parseFloat(document.getElementById("txAmount").value);
  const category_id = document.getElementById("txCategory").value || null;
  const description = document.getElementById("txDescription").value.trim();
  const transaction_date = document.getElementById("txDate").value;

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid positive amount", "danger");
    return;
  }

  if (!transaction_date) {
    showToast("Please select a date", "danger");
    return;
  }

  const payload = {
    type,
    amount,
    category_id,
    description,
    transaction_date,
  };

  const url = currentEditingId
    ? `/transactions/${currentEditingId}`
    : "/transactions";
  const method = currentEditingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(result.message || "Saved successfully", "success");
      closeModal();
      fetchTransactions();
    } else {
      showToast(result.message || "Failed to save", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error, please try again", "danger");
  }
}

async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  try {
    const response = await fetch(`/transactions/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      showToast(result.message || "Deleted successfully", "success");
      fetchTransactions();
    } else {
      showToast(result.message || "Failed to delete", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error, please try again", "danger");
  }
}

async function logout() {
  try {
    const response = await fetch("/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      localStorage.removeItem("user");
      window.location.href = "/pages/login.html";
    } else {
      showToast("Logout failed", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error during logout", "danger");
  }
}

function showToast(message, type = "primary") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-premium toast-${type}`;
  toast.innerHTML = `
        <span>${message}</span>
    `;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
