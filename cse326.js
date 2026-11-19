// Sample order database
const orders = {
    "ORD1001": {
        product: "Wireless Headphones",
        price: 1999,
        date: "2026-10-20"
    },

    "ORD1002": {
        product: "Smart Watch",
        price: 2999,
        date: "2026-09-10"
    },

    "ORD1003": {
        product: "Keyboard",
        price: 999,
        date: "2026-10-25"
    }
};

// Store return requests
let requests = JSON.parse(
    localStorage.getItem("returnRequests")
) || [];

let checkedOrder = null;

// Save data
function saveData() {
    localStorage.setItem(
        "returnRequests",
        JSON.stringify(requests)
    );
}

// Navigation
document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn")
            .forEach(btn => btn.classList.remove("active"));

        document.querySelectorAll(".page")
            .forEach(page => page.classList.remove("active"));

        button.classList.add("active");

        document.getElementById(
            button.dataset.page
        ).classList.add("active");

        updateDashboard();
        displayRequests();
    });
});

// Check order details
document.getElementById("checkOrder")
.addEventListener("click", () => {

    const id = document.getElementById("orderId")
        .value.trim().toUpperCase();

    const details = document.getElementById("orderDetails");

    checkedOrder = null;

    if (!orders[id]) {
        details.innerHTML = "Order not found!";
        return;
    }

    const order = orders[id];

    const days = Math.floor(
        (new Date() - new Date(order.date)) /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0 || days > 30) {
        details.innerHTML =
            "Order found: " + order.product +
            "<br>Return eligibility: Not eligible (30-day return policy).";
        return;
    }

    checkedOrder = id;

    details.innerHTML =
        "<b>Order Found!</b>" +
        "<br>Product: " + order.product +
        "<br>Price: ₹" + order.price +
        "<br>Order Date: " + order.date +
        "<br>Return Eligibility: Eligible";
});

// Submit return request
document.getElementById("returnForm")
.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const id = document.getElementById("orderId").value.trim().toUpperCase();
    const reason = document.getElementById("reason").value;
    const description = document.getElementById("description").value;

    const message = document.getElementById("formMessage");

    if (!checkedOrder || checkedOrder !== id) {
        message.textContent = "Please check an eligible order first!";
        message.style.color = "red";
        return;
    }

    if (requests.some(r => r.orderId === id && r.status !== "Rejected")) {
        message.textContent = "A return request already exists for this order.";
        message.style.color = "red";
        return;
    }

    const request = {
        requestId: "RET" + Date.now().toString().slice(-7),
        customer: name,
        orderId: id,
        product: orders[id].product,
        reason: reason,
        description: description,
        status: "Pending",
        refund: "Not initiated"
    };

    requests.push(request);
    saveData();

    message.textContent =
        "Return request submitted successfully! Your ID: " +
        request.requestId;

    message.style.color = "green";

    document.getElementById("returnForm").reset();
    document.getElementById("orderDetails").innerHTML = "";
    checkedOrder = null;

    updateDashboard();
    displayRequests();
});

// Display requests in admin table
function displayRequests() {

    const table = document.getElementById("returnTable");

    table.innerHTML = "";

    if (requests.length === 0) {
        table.innerHTML =
            '<tr><td colspan="7">No return requests available.</td></tr>';
        return;
    }

    requests.forEach((request, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${request.requestId}</td>
            <td>${request.customer}</td>
            <td>${request.orderId}</td>
            <td>${request.product}</td>
            <td>${request.reason}</td>
            <td class="status ${request.status.toLowerCase()}">
                ${request.status}
            </td>
            <td>
                ${
                    request.status === "Pending"
                    ? `
                        <button class="action-btn approve"
                        data-index="${index}" data-action="approve">
                        Approve</button>

                        <button class="action-btn reject"
                        data-index="${index}" data-action="reject">
                        Reject</button>
                    `
                    : "Completed"
                }
            </td>
        `;

        table.appendChild(row);
    });
}

// Admin approval and rejection
document.getElementById("returnTable")
.addEventListener("click", event => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === "approve") {
        requests[index].status = "Approved";
        requests[index].refund = "Refund initiated";
    }

    if (action === "reject") {
        requests[index].status = "Rejected";
        requests[index].refund = "Not applicable";
    }

    saveData();
    displayRequests();
    updateDashboard();
});

// Dashboard statistics
function updateDashboard() {

    document.getElementById("totalCount").textContent =
        requests.length;

    document.getElementById("pendingCount").textContent =
        requests.filter(r => r.status === "Pending").length;

    document.getElementById("approvedCount").textContent =
        requests.filter(r => r.status === "Approved").length;

    document.getElementById("rejectedCount").textContent =
        requests.filter(r => r.status === "Rejected").length;
}

// Track return request
document.getElementById("trackButton")
.addEventListener("click", () => {

    const id = document.getElementById("trackingId")
        .value.trim().toUpperCase();

    const result = document.getElementById("trackingResult");

    const request = requests.find(
        r => r.requestId.toUpperCase() === id
    );

    if (!request) {
        result.innerHTML =
            "<p style='color:red;margin-top:15px'>Request not found!</p>";
        return;
    }

    result.innerHTML = `
        <div class="tracking-card">
            <h3>Return Details</h3>
            <p><b>Request ID:</b> ${request.requestId}</p>
            <p><b>Customer:</b> ${request.customer}</p>
            <p><b>Product:</b> ${request.product}</p>
            <p><b>Reason:</b> ${request.reason}</p>
            <p><b>Return Status:</b> ${request.status}</p>
            <p><b>Refund Status:</b> ${request.refund}</p>
        </div>
    `;
});

// Initial page loading
updateDashboard();
displayRequests();