async function performSearchByInterests() {
    const difficulty = document.querySelector('.btn.btn-primary.btn-rounded.clicked').textContent;
    const length = document.querySelector('.btn.btn-secondary.btn-rounded.clicked').textContent;
    const interests = document.getElementById('search-input').value;
    var imagesWithoutOne = document.querySelectorAll('img:not([src*="1"])');
    var resultArray = [];
    imagesWithoutOne.forEach(function (image) {
        if (image.parentElement.id.toString().includes("form") || image.parentElement.id.toString().includes("search")) {
            return;
        }
        var parentId = image.parentElement.id;
        resultArray.push(parentId);
    });

    await fetch("/books/params", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            difficulty: difficulty,
            length: length,
            interests: interests,
            genre: resultArray.join(",")
        })
    }
    ).then(response => response.json())
        .then(data => {
            let mainDiv = document.getElementById('main-card-div');
            mainDiv.innerHTML = "";

            let books = data.slice(0,4);
            let counter = 0;
            books.forEach(book => {
                console.log(book)
                mainDiv.innerHTML += `
                    <article id="book-${counter}" class="brick entry" data-animate-el>
                        <div class="entry__thumb slika">
                            <a id="image-${counter}" href="single-standard.html" class="thumb-link">
                                <img src="${book.image}"
                                    alt="">
                            </a>
                        </div>
                        <div class="entry__text">
                            <div class="entry__header">
                                <div class="entry__meta">
                                    <span class="cat-links">
                                        <a href="#">Author</a>
                                    </span>
                                    <span class="byline">
                                        By:
                                        <a href="#0">${book.author}</a>
                                    </span>
                                </div>
                                <h1 class="entry__title"><a>${book.title}</a></h1>
                                <b><a id="read-more-${counter}" class="read-more-button" class="entry__more-link">Request this book</a></b>
                            </div>
                            <div class="entry__excerpt">
                                <p id="text-${counter}" style="font-style:normal">
                                    ${book.summary.substring(0, 400)}...
                
                
            
                                    </p>
                            </div>
                            
                        </div> <!-- end entry__text -->
                    </article> <!-- end article -->
                `
                counter += 1;
            });
        })
}