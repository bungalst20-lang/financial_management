async function register() {
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!fullName || !username || !password) {
    showToast("Please fill all fields", "danger");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match", "danger");
    return;
  }

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        username,
        password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Registration successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/pages/login.html";
      }, 1500);
    } else {
      showToast(result.message || "Registration failed", "danger");
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

  // Trigger animate-in
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
