// ===== Admin Dashboard Logic =====

// Check authentication
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "ADMIN") 
{
  window.location.href = "login.html";
}

// Elements
const usersTable = document.getElementById("usersTable");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

const statusMessage = document.getElementById("statusMessage");

// Fetch and render users
async function loadUsers() 
{
  try {
    const response = await fetch("http://localhost:3000/admin/users", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    usersTable.innerHTML = "";
    statusMessage.textContent = "";

    users.forEach(user => {
      const row = document.createElement("tr");

      let statusColor = "black";
      if (user.accessStatus === "ACTIVE") statusColor = "green";
      if (user.accessStatus === "EXPIRED") statusColor = "orange";
      if (user.accessStatus === "NOT_GRANTED") statusColor = "red";
      if (user.accessStatus === "INACTIVE") statusColor = "gray";

      <td style="color:${statusColor}">${user.accessStatus}</td>
      
      row.innerHTML = `
        <td>${user.userId}</td>
        <td>${user.role}</td>
        <td>${user.accessStatus}</td>
        <td>${formatDate(user.accessGrantedAt)}</td>
        <td>${formatDate(user.accessExpiresAt)}</td>
        <td>
          ${renderActionButtons(user)}
        </td>
      `;

      usersTable.appendChild(row);
    });

  } 
  catch (err) 
  {
    console.error("Admin load error:", err);
    statusMessage.textContent = "Failed to load users";
    statusMessage.style.color = "red";
    usersTable.innerHTML =
      `<tr><td colspan="6">No data available</td></tr>`;
  }
}

// Render action buttons
function renderActionButtons(user) {
  if (user.accessStatus === "ACTIVE") {
    return `<button onclick="revokeAccess('${user.userId}')">Revoke</button>`;
  } else {
    return `<button onclick="grantAccess('${user.userId}')">Grant</button>`;
  }
}

// Grant access
async function grantAccess(userId) {
  try {
    const response = await fetch("http://localhost:3000/admin/grant-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error("Grant failed");
    }

    alert("Access granted");
    loadUsers();

  } catch (err) {
    alert("Failed to grant access");
  }
}

// Revoke access
async function revokeAccess(userId) {
  try {
    const response = await fetch("http://localhost:3000/admin/revoke-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error("Revoke failed");
    }

    alert("Access revoked");
    loadUsers();

  } catch (err) {
    alert("Failed to revoke access");
  }
}

// Format date
function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

// Initial load
loadUsers();
