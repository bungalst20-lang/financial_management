document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

let currentEditingId = null;

async function fetchCategories() {
  try {
    const response = await fetch("/categories");
    if (response.status === 401) {
      window.location.href = "/pages/login.html";
      return;
    }

    const categories = await response.json();
    renderCategories(categories);
  } catch (err) {
    console.error(err);
    showToast("Error loading categories", "danger");
  }
}

function renderCategories(categories) {
  const listEl = document.getElementById("categoryList");
  if (!listEl) return;

  if (!categories.length) {
    listEl.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">No categories created yet. Click "Add Category" to start!</td>
            </tr>
        `;
    return;
  }

  listEl.innerHTML = categories
    .map(
      (c) => `
        <tr>
            <td class="font-semibold">${c.name}</td>
            <td>
                <span class="badge-premium badge-category">ID: ${c.id}</span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button onclick="openEditModal(${c.id}, '${escapeHtml(c.name)}')" class="btn-premium btn-premium-secondary btn-sm py-1 px-2 text-xs">
                        Edit
                    </button>
                    <button onclick="deleteCategory(${c.id})" class="btn-premium btn-premium-danger btn-sm py-1 px-2 text-xs">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openAddModal() {
  currentEditingId = null;
  document.getElementById("modalTitle").textContent = "Add Category";
  document.getElementById("categoryNameInput").value = "";
  document.getElementById("categoryModal").classList.add("active");
}

async function openEditModal(id, name) {
  currentEditingId = id;
  document.getElementById("modalTitle").textContent = "Edit Category";

  // Pre-populate with current values (either from parameters or detail endpoint)
  // We can fetch detail to test our new GET /categories/:id endpoint!
  try {
    const response = await fetch(`/categories/${id}`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById("categoryNameInput").value = data.name;
    } else {
      document.getElementById("categoryNameInput").value = name;
    }
  } catch (err) {
    document.getElementById("categoryNameInput").value = name;
  }

  document.getElementById("categoryModal").classList.add("active");
}

function closeModal() {
  document.getElementById("categoryModal").classList.remove("active");
}

async function saveCategory() {
  const name = document.getElementById("categoryNameInput").value.trim();
  if (!name) {
    showToast("Category name is required", "danger");
    return;
  }

  const url = currentEditingId
    ? `/categories/${currentEditingId}`
    : "/categories";
  const method = currentEditingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(result.message || "Saved successfully", "success");
      closeModal();
      fetchCategories();
    } else {
      showToast(result.message || "Failed to save", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error, please try again", "danger");
  }
}

async function deleteCategory(id) {
  if (
    !confirm(
      "Are you sure you want to delete this category? This might affect transactions mapped to this category.",
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/categories/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      showToast(result.message || "Deleted successfully", "success");
      fetchCategories();
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
