const loginBtn = document.getElementById("loginBtn");
const messageEl = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const UserId = document.getElementById("UserId").value.trim();
  const Password = document.getElementById("Password").value.trim();

  messageEl.textContent = "";
  messageEl.style.color = "red";

  if (!UserId || !Password) 
  {
    messageEl.textContent = "User ID and Password are required";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        UserId,
        Password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      messageEl.textContent = data.message || "Login failed";
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    messageEl.style.color = "green";
    messageEl.textContent = "Login successful! Redirecting...";

    // Redirect based on role
    setTimeout(() => {
      if (data.role === "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    }, 800);

  } 
  catch (err) 
  {
    console.error("Login error:", err);
    messageEl.textContent = "Server not reachable";
  }
});
