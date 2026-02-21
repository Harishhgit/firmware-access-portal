async function loadAccessLogs() 
{
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/admin/access-logs", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        const table = document.getElementById("logsTable");
        table.innerHTML = "";

        if (!data || data.length === 0) {
            table.innerHTML = `<tr><td colspan="4">No logs found</td></tr>`;
            return;
        }

        data.forEach(log => {
            const row = `
                <tr>
                    <td>${log.UserId}</td>
                    <td>${log.Endpoint}</td>
                    <td>${new Date(log.AccessTime).toLocaleString()}</td>
                    <td>${log.Status}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

    } catch (err) {
        document.getElementById("logsTable").innerHTML =
            `<tr><td colspan="4">Failed to load logs</td></tr>`;
    }
}
