const bookId = localStorage.getItem("bookId");
console.log(bookId)

fetch(`/quiz/${bookId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        
        document.querySelector("#bookimg").src = data.image;
        document.querySelector("#title").innerHTML = data.title;
        document.querySelector("#summary").innerHTML = data.summary;
        const questions = document.querySelector(".faq-section");
        for (let i = 0; i < data.questions.length; i++) {
            questions.innerHTML += `
            <div class="faq-item">
                <h4>Q${i + 1}: ${data.questions[i].question}</h4>
                <p>A${i + 1}: ${data.questions[i].answer}</p>
            </div>
            `
        }
    });