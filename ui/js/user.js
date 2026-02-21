// ===== User Dashboard Logic =====

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "USER") {
  window.location.href = "login.html";
}

const statusMessage = document.getElementById("statusMessage");
const downloadBtn = document.getElementById("downloadBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Check access by calling firmware API (safe check)
async function checkAccess() {
  try {
    const response = await fetch("http://localhost:3000/firmware/download", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) 
    {
      statusMessage.textContent = "Access active. You can download firmware.";
      statusMessage.style.color = "green";
      downloadBtn.disabled = false;
    } 
    else 
    {
      statusMessage.textContent = data.message || "Access denied";
      statusMessage.style.color = "red";
      downloadBtn.disabled = true;
    }

  } 
  catch (err) 
  {
    statusMessage.textContent = "Server not reachable";
    statusMessage.style.color = "red";
  }
}

// Download firmware
downloadBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3000/firmware/download", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Download failed");
      return;
    }

    alert("Firmware download allowed (replace with real file later)");

  } catch (err) {
    alert("Server error");
  }
});

// Initial check
checkAccess();
