let categoryChart = null;
let trendChart = null;

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});

async function initDashboard() {
  // Show user greeting if available
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.fullName) {
    const welcomeEl = document.getElementById("welcomeUser");
    if (welcomeEl) welcomeEl.textContent = user.fullName;
  }

  try {
    // Fetch transactions
    const response = await fetch("/transactions");
    if (response.status === 401) {
      window.location.href = "/pages/login.html";
      return;
    }

    const transactions = await response.json();

    // Fetch categories to show category counts or resolve category details
    const catRes = await fetch("/categories");
    const categories = await catRes.json();

    calculateKPIs(transactions);
    renderRecentTransactions(transactions);
    renderCharts(transactions, categories);
  } catch (err) {
    console.error("Error initializing dashboard:", err);
    showToast("Failed to load dashboard data", "danger");
  }
}

function calculateKPIs(transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    const amt = parseFloat(t.amount);
    if (t.type === "income") {
      income += amt;
    } else if (t.type === "expense") {
      expense += amt;
    }
  });

  const balance = income - expense;

  document.getElementById("totalBalance").textContent = formatCurrency(balance);
  document.getElementById("totalIncome").textContent = formatCurrency(income);
  document.getElementById("totalExpense").textContent = formatCurrency(expense);

  // Apply color to balance based on positive/negative
  const balanceEl = document.getElementById("totalBalance");
  if (balance < 0) {
    balanceEl.classList.add("text-danger");
    balanceEl.classList.remove("text-success");
  } else {
    balanceEl.classList.add("text-success");
    balanceEl.classList.remove("text-danger");
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderRecentTransactions(transactions) {
  const listEl = document.getElementById("recentTransactionsList");
  if (!listEl) return;

  if (!transactions.length) {
    listEl.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No transactions found. Go to Transactions page to add some!</td>
            </tr>
        `;
    return;
  }

  // Get top 5 transactions
  const recents = transactions.slice(0, 5);
  listEl.innerHTML = recents
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
            </tr>
        `;
    })
    .join("");
}

function renderCharts(transactions, categories) {
  // 1. Expense by Category Breakdown
  const expenseByCategory = {};

  // Seed with existing category names
  categories.forEach((c) => {
    expenseByCategory[c.name] = 0;
  });
  expenseByCategory["Uncategorized"] = 0;

  transactions.forEach((t) => {
    if (t.type === "expense") {
      const catName = t.category_name || "Uncategorized";
      expenseByCategory[catName] =
        (expenseByCategory[catName] || 0) + parseFloat(t.amount);
    }
  });

  // Filter categories with 0 expenses to keep chart clean
  const catLabels = [];
  const catData = [];
  Object.entries(expenseByCategory).forEach(([key, val]) => {
    if (val > 0) {
      catLabels.push(key);
      catData.push(val);
    }
  });

  // Render Doughnut Chart
  const ctxCategory = document.getElementById("expenseCategoryChart");
  if (ctxCategory) {
    if (categoryChart) categoryChart.destroy();

    if (catData.length === 0) {
      // Draw placeholder or show empty text
      ctxCategory.style.display = "none";
      document.getElementById("noChartDataMessage").style.display = "block";
    } else {
      ctxCategory.style.display = "block";
      document.getElementById("noChartDataMessage").style.display = "none";

      categoryChart = new Chart(ctxCategory, {
        type: "doughnut",
        data: {
          labels: catLabels,
          datasets: [
            {
              data: catData,
              backgroundColor: [
                "#f1aa09",
                "#2ecc71",
                "#ff7675",
                "#54a0ff",
                "#feca57",
                "#a29bfe",
                "#fd79a8",
                "#00cec9",
                "#ffeaa7",
                "#fab1a0",
              ],
              borderWidth: 3,
              borderColor: "#000000",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                color: "#000000",
                font: {
                  family: "Plus Jakarta Sans",
                  size: 11,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` ${context.label}: ${formatCurrency(context.raw)}`;
                },
              },
            },
          },
          cutout: "60%",
        },
      });
    }
  }

  // 2. Income vs Expense Trend Chart (Last 6 distinct days or simplified aggregate)
  // Group transactions by date
  const dateGroups = {};
  transactions.slice(0, 30).forEach((t) => {
    const d = new Date(t.transaction_date).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    });
    if (!dateGroups[d]) {
      dateGroups[d] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      dateGroups[d].income += parseFloat(t.amount);
    } else {
      dateGroups[d].expense += parseFloat(t.amount);
    }
  });

  const dates = Object.keys(dateGroups).reverse();
  const incomeTrend = dates.map((d) => dateGroups[d].income);
  const expenseTrend = dates.map((d) => dateGroups[d].expense);

  const ctxTrend = document.getElementById("incomeExpenseTrendChart");
  if (ctxTrend) {
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctxTrend, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Income",
            data: incomeTrend,
            backgroundColor: "#2ecc71",
            borderColor: "#000000",
            borderWidth: 3,
            borderRadius: 0,
          },
          {
            label: "Expense",
            data: expenseTrend,
            backgroundColor: "#ff7675",
            borderColor: "#000000",
            borderWidth: 3,
            borderRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#000000", font: { weight: "bold" } },
            border: { color: "#000000", width: 3 },
          },
          y: {
            grid: { color: "rgba(0, 0, 0, 0.08)" },
            ticks: { color: "#000000", font: { weight: "bold" } },
            border: { color: "#000000", width: 3 },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#000000",
              font: { family: "Plus Jakarta Sans", weight: "bold" },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
              },
            },
          },
        },
      },
    });
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
