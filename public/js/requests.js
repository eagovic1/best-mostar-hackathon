fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email: "test",
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
                    <td>Jane Smith</td>
                    <td>${_request.title}</td>
                    <td><button type="button" class="btn btn-success">Approve</button></td>
                    <td><button type="button" class="btn btn-danger">Reject</button></td>
                </tr>
                    `;
                        document.getElementById("pending-requests").appendChild(row);
                    });
                } else {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                <td colspan="4">No pending requests</td>
                `;
                    document.getElementById("pending-requests").appendChild(row);
                }
            });

    });
