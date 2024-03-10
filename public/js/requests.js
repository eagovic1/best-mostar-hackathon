function requestStatusChange(requestId, status) {
    console.log(requestId, status);
    fetch("/request/book/status", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requestId: requestId,
            status: status,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success) {
                location.reload();
            }
        });
}

function openBookDetails(bookId) {
    console.log(bookId);
    localStorage.setItem("bookId", bookId);
    window.location.href = "/profBookDetails.html";
}

fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email: "aboudellaa1@etf.unsa.ba",
        password: "test"
    })
}).then((response) => response.json())
    .then((data) => {
        console.log(data);
        fetch("/history/pending", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.length > 0) {
                    data.forEach((_request) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                <tr>
                    <td>${_request.name}</td>
                    <td>${_request.title}</td>
                    <td>${_request.date}</td>
                    <td>${(Boolean)(_request.graded)}</td>
                    <td><button onclick="requestStatusChange('${_request.id}', 'approved')" type="button" class="btn btn-success">Approve</button></td>
                    <td><button onclick="requestStatusChange('${_request.id}', 'rejected')" type="button" class="btn btn-danger">Reject</button></td>
                </tr>
                    `;
                        document.getElementById("pending-requests").appendChild(row);
                    });
                } else {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                <td colspan="6">No pending requests</td>
                `;
                    document.getElementById("pending-requests").appendChild(row);
                }
            });

        fetch("/history/approved", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.length > 0) {
                    data.forEach((_request) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                <tr>
                    <td>${_request.name}</td>
                    <td>${_request.title}</td>
                    <td>${_request.date}</td>
                    <td>${(Boolean)(_request.graded)}</td>
                    <td><button onclick="openBookDetails('${_request.bookId}')" type="button" class="btn btn-dark">Details</button></td>
                </tr>
                    `;
                        document.getElementById("approved-requests").appendChild(row);
                    });
                } else {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                <td colspan="5">No approved requests</td>
                `;
                    document.getElementById("approved-requests").appendChild(row);
                }
            });

    });
