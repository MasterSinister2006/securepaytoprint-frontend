// ================= ADMIN DASHBOARD LOGIC =================

// Auto load dashboard
window.onload = () => {
  loadDashboardStats();
  loadPrinterStatus();
  loadOrders();
  setInterval(loadPrinterStatus, 5000);   // refresh printer status every 5 sec
  setInterval(loadOrders, 5000);          // refresh orders every 5 sec
};

// ================= VIEW SWITCHING =================
function showView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(view + "View").classList.remove("hidden");

  document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
  event.target.classList.add("active");
}

// ================= DASHBOARD =================
function loadDashboardStats() {
  fetch("/admin/summary/today")
    .then(res => res.json())
    .then(data => {
      let totalOrders = 0;
      let totalRevenue = 0;

      data.forEach(p => {
        totalOrders++;
        totalRevenue += p.revenue;
      });

      document.getElementById("totalOrders").innerText = totalOrders;
      document.getElementById("totalRevenue").innerText = totalRevenue;
    });

  fetch("/admin/printer-status")
    .then(res => res.json())
    .then(data => {
      const active = data.filter(p => p.paper > 0).length;
      document.getElementById("activePrinters").innerText = active;
    });
}

// ================= PRINTER STATUS =================
function loadPrinterStatus() {
  fetch("/admin/printer-status")
    .then(res => res.json())
    .then(printers => {
      const container = document.getElementById("printerCards");
      container.innerHTML = "";

      printers.forEach(p => {
        let statusClass = "green";

        if (p.paper <= 0 || (p.black_ink <= 0 && p.color_ink <= 0)) {
          statusClass = "red";
        } else if (p.paper < 10 || p.black_ink < 10 || p.color_ink < 10) {
          statusClass = "yellow";
        }

        const card = document.createElement("div");
        card.className = `printer-card ${statusClass}`;
        card.innerHTML = `
          <h3>${p.printer_id}</h3>
          <p>Paper: ${p.paper}</p>
          <p>Black Ink: ${p.black_ink.toFixed(1)}</p>
          <p>Color Ink: ${p.color_ink.toFixed(1)}</p>
        `;
        container.appendChild(card);
      });
    });
}

// ================= ORDERS =================
function loadOrders() {
  const today = new Date().toISOString().split("T")[0];

  fetch(`/admin/orders?date=${today}`)
    .then(res => res.json())
    .then(orders => {
      const table = document.getElementById("ordersTable");
      table.innerHTML = "";

      orders.forEach(o => {
        const tr = document.createElement("tr");

        // Default status logic (you can refine later)
        let status = "done"; // backend can later manage real-time state
        let statusText = "DONE";

        const statusHTML = `<span class="status ${status}">${statusText}</span>`;

        tr.innerHTML = `
          <td>${o.token}</td>
          <td>${o.phone || "N/A"}</td>
          <td>${o.printer_id}</td>
          <td>${o.pages}</td>
          <td>${o.print_type.toUpperCase()}</td>
          <td>₹${o.amount}</td>
          <td>${statusHTML}</td>
          <td>${new Date(o.time).toLocaleTimeString()}</td>
        `;
        table.appendChild(tr);
      });
    });
}
