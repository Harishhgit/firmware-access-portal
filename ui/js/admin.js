// ===== Admin Dashboard Logic =====

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "ADMIN") {
  window.location.href = "login.html";
}

// Elements
const usersTable = document.getElementById("usersTable");
const logoutBtn = document.getElementById("logoutBtn");
const statusMessage = document.getElementById("statusMessage");

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Load users
async function loadUsers() {
  try {
    statusMessage.textContent = "Loading users...";

    const response = await fetch("http://localhost:3000/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    usersTable.innerHTML = "";
    statusMessage.textContent = "";

    if (users.length === 0) {
      usersTable.innerHTML =
        `<tr><td colspan="6">No users found</td></tr>`;
      return;
    }

    users.forEach(user => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.userId}</td>
        <td>${user.role}</td>
        <td class="status-{user.accessStatus}">${user.accessStatus} </td>
        <td>${formatDate(user.accessGrantedAt)}</td>
        <td>${formatDate(user.accessExpiresAt)}</td>
        <td>
          ${
            user.accessStatus === "ACTIVE"
              ? `<button class="btn-revoke" onclick="revokeAccess('${user.userId}')">Revoke</button>`
              : `<button class="btn-grant" onclick="grantAccess('${user.userId}')">Grant</button>`
          }
        </td>
      `;

      usersTable.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    statusMessage.textContent = "Failed to load users";
    usersTable.innerHTML =
      `<tr><td colspan="6">Error loading users</td></tr>`;
  }
}

// Grant access
async function grantAccess(userId) 
{
  await fetch("http://localhost:3000/admin/grant-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

// Revoke access
async function revokeAccess(userId) {
  await fetch("http://localhost:3000/admin/revoke-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

// Date formatter
function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

// Initial load
loadUsers();


/* function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

  sidebar.classList.toggle("open");
  main.classList.toggle("shift");
} */

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}


function toggleFirmwareMenu() {
  const menu = document.getElementById("firmwareMenu");
  const arrow = document.getElementById("fwArrow");

  menu.classList.toggle("hidden");
  arrow.textContent = menu.classList.contains("hidden") ? "▶" : "▼";
}

