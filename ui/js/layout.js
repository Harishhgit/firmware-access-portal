function toggleSidebar()
{
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

  sidebar.classList.toggle("hidden");
  main.classList.toggle("full");
}

function toggleFirmwareMenu() 
{
  const menu = document.getElementById("firmwareMenu");
  const arrow = document.getElementById("fwArrow");

  menu.classList.toggle("hidden");
  arrow.textContent = menu.classList.contains("hidden") ? "▶" : "▼";
}

function logout() 
{
  localStorage.clear();
  window.location.href = "/login.html";
}


// ===== TEMPLATE LOADER =====

function loadTemplate(templateId) 
{
  const tpl = document.getElementById(templateId);
  const main = document.getElementById("main");

  if (!tpl || !main) return;

  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));

  // 🔗 Auto hook for logs
  if (templateId === "tpl-fw-logs") {
    loadAccessLogs();
  }
}

/* function loadTemplate(templateId) {
  const tpl = document.getElementById(templateId);
  const main = document.getElementById("main");

  if (!tpl || !main) return;

  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));
} */


// ===== MENU BINDING =====
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("menuDashboard")
    ?.addEventListener("click", () => loadTemplate("tpl-dashboard"));

  /* document.getElementById("menuUsers")
    ?.addEventListener("click", () => loadTemplate("tpl-users")); */

    document.getElementById("menuUsers")
    .addEventListener("click", () => { loadTemplate("tpl-users"); loadUsers(); });

  document.getElementById("menuFwDownload")
    ?.addEventListener("click", () => loadTemplate("tpl-fw-download"));

  /* document.getElementById("menuFwLogs")
    ?.addEventListener("click", () => loadTemplate("tpl-fw-logs")); */

  document.getElementById("menuFwLogs")
  .addEventListener("click", () => {
    loadTemplate("tpl-fw-logs");
    loadAccessLogs();   // ← ADD THIS
  });
    

  document.getElementById("menuSettings")
    ?.addEventListener("click", () => loadTemplate("tpl-settings"));

});

async function loadAccessLogs() 
{
  const tbody = document.getElementById("logsTable");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4">Loading logs...</td></tr>`;

  try 
  {
    const token = localStorage.getItem("token");

    const res = await fetch("firmware/logs", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const logs = await res.json();

    if (!logs.length) 
    {
      tbody.innerHTML = `<tr><td colspan="4">No logs found</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${l.UserId}</td>
        <td>${l.Endpoint}</td>
        <td>${new Date(l.AccessTime).toLocaleString()}</td>
        <td>${l.Status}</td>
      </tr>
    `).join("");

  } 
  catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading logs</td></tr>`;
    console.log(err);
  }
}


async function loadUsers() 
{
  const tbody = document.getElementById("usersTable");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6">Loading users...</td></tr>`;

  try 
  {
    const token = localStorage.getItem("token");

    const res = await fetch("/admin/users", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const users = await res.json();

    if (!users.length) 
    {
      tbody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.userId}</td>
        <td>${u.role}</td>
        <td>${u.accessStatus}</td>
        <td>${u.accessGrantedAt || "-"}</td>
        <td>${u.accessExpiresAt || "-"}</td>
        <td>
            <button class="btn-grant" data-userid="${u.UserId}">Grant</button>
            <button class="btn-revoke" data-userid="${u.UserId}">Revoke</button>
            <button class="btn-edit" data-userid="${u.UserId}">Edit</button>
            <button class="btn-delete" data-userid="${u.UserId}">Delete</button>
        </td>
      </tr>
    `).join("");

    attachUserActionEvents();

  } 
  catch (err) 
  {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6">Failed to load users</td></tr>`;
  }

}


function attachUserActionEvents() 
{

  document.querySelectorAll(".btn-grant").forEach(btn => {
       btn.addEventListener("click", () => { grantAccess(btn.dataset.userid); });
    });

  document.querySelectorAll(".btn-revoke").forEach(btn => {
    btn.addEventListener("click", () => {
      revokeAccess(btn.dataset.userid);
    });
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteUser(btn.dataset.userid);
    });
  });

}

async function grantAccess(userId) 
{
  const token = localStorage.getItem("token");

  await fetch("/admin/grant-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers(); // refresh table
}

async function revokeAccess(userId) 
{
  const token = localStorage.getItem("token");

  await fetch("/admin/revoke-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

async function revokeAccess(userId) {
  const token = localStorage.getItem("token");

  await fetch("/admin/revoke-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

// -----------------------------------------------------------------------//

async function grantUser(userId) {
  const token = localStorage.getItem("token");

  await fetch("/admin/grant-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

async function revokeUser(userId) {
  const token = localStorage.getItem("token");

  await fetch("/admin/revoke-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}

function editUser(userId) {
  alert("Edit user: " + userId);
}

async function deleteUser(userId) {
  if (!confirm("Delete user " + userId + "?")) return;

  const token = localStorage.getItem("token");

  await fetch("/admin/delete-user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ userId })
  });

  loadUsers();
}
