
let serachButton = document.getElementById('search-button');

let cardDiv = document.getElementById('main-card-div');

let searchField = document.getElementById('search-input-field');

let globalBooks = [];

async function login() {
    await fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'test',
            password: 'test'
        })
    }
    ).then(response => response.json())
        .then(data => {
            console.log(data);
        })
}


serachButton.addEventListener('click', async (e) => {

    console.log("pritisnuto");
    e.preventDefault();
    let counter = 0;
    await login();
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState == 4 && ajax.status == 200) {
            globalBooks = JSON.parse(ajax.responseText);
            let mainDiv = document.getElementById('main-card-div');
            mainDiv.innerHTML = "";

            let books = globalBooks;

            books.forEach(book => {
                if (book.volumeInfo.description == undefined) {
                    book.volumeInfo.description = "No description available"
                }
                console.log(book)
                mainDiv.innerHTML += `
                    <article id="book-${counter}" class="brick entry" data-animate-el>
                        <div class="entry__thumb slika">
                            <a id="image-${counter}" href="single-standard.html" class="thumb-link">
                                <img src="${book.volumeInfo.imageLinks.thumbnail}"
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
                                        <a href="#0">${book.volumeInfo.authors}</a>
                                    </span>
                                </div>
                                <h1 class="entry__title"><a>${book.volumeInfo.title}</a></h1>
                                <b><a id="read-more-${counter}" class="read-more-button" class="entry__more-link">Request this book</a></b>
                            </div>
                            <div class="entry__excerpt">
                                <p id="text-${counter}" style="font-style:normal">
                                    ${book.volumeInfo.description.substring(0, 400)}...

                
                    <b><a id="button-${counter}" class="show-more-button" class="entry__more-link">Show more</a></b>
                
                
                                    </p>
                            </div>
                            
                        </div> <!-- end entry__text -->
                    </article> <!-- end article -->
                `
                counter += 1;
            });

            const buttons = document.querySelectorAll('.show-more-button');

            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.target.style.display = 'none';
                    let paragraph = document.getElementById(`text-${e.target.id.substr(e.target.id.length - 1)}`);
                    paragraph.innerHTML = globalBooks[e.target.id.substr(e.target.id.length - 1)].volumeInfo.description;
                });
            });


            let images = document.querySelectorAll('.read-more-button');

            images.forEach(image => {
                image.addEventListener('click', (e) => {
                    e.preventDefault();
                    let bookId = e.target.id.substr(e.target.id.length - 1);

                    let ajaxLocal = new XMLHttpRequest();
                    ajaxLocal.onreadystatechange = () => {
                        if (ajaxLocal.readyState == 4 && ajaxLocal.status == 200) {
                            
                        }
                        else if(ajaxLocal.readyState == 4 && ajaxLocal.status == 400){
                            alert("Book already requested")
                        }
                    }
                    ajaxLocal.open('POST', '/request/book', true);
                    ajaxLocal.send({bookId: globalBooks[bookId].id});


                    
                })
            })



        }
    }
    ajax.open('GET', `/books/${searchField.value}`, true);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send();
})