async function resetPassword() {
  const username = document.getElementById("username").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!username || !newPassword || !confirmPassword) {
    showToast("Please fill all fields", "danger");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match", "danger");
    return;
  }

  try {
    const response = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        newPassword,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showToast(
        "Password reset successful! Redirecting to login...",
        "success",
      );
      setTimeout(() => {
        window.location.href = "/pages/login.html";
      }, 1500);
    } else {
      showToast(result.message || "Reset failed", "danger");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error, please try again", "danger");
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
