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

function stripHtmlTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

window.onload = async function () {
    await login()
    let counter = 0;
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState == 4 && ajax.status == 200) {
            globalBooks = JSON.parse(ajax.responseText);
            let mainDiv = document.getElementById('main-card-div');
          
            let books = globalBooks;

            books.forEach(book => {
                mainDiv.innerHTML += `
                    <article id="book-${counter}" class="brick entry" data-animate-el>
                        <div class="entry__thumb">
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
                                        <a href="#0">${book.authors}</a>
                                    </span>
                                </div>
                                <h1 class="entry__title"><a href="single-standard.html">${book.title}</a></h1>
                            </div>
                            <div class="entry__excerpt">
                                <p id="text-${counter}" style="font-style:normal">
                                    ${stripHtmlTags(book.description).substring(0, 400)}... <b><a id="button-${counter}" class="read-more-button" class="entry__more-link">Show more</a></b>
                                </p>
                            </div>
                            
                        </div> <!-- end entry__text -->
                    </article> <!-- end article -->
                `
                counter += 1;
            });

            const buttons = document.querySelectorAll('.read-more-button');

            const images = document.querySelectorAll('.thumb-link');

            images.forEach(image => {
                image.addEventListener('click', (e) => {
                    e.preventDefault();
                    let bookId = e.target.id.substr(e.target.id.length - 1);
                
                });
            })


            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.target.style.display = 'none';
                    let paragraph = document.getElementById(`text-${e.target.id.substr(e.target.id.length - 1)}`);
                    paragraph.innerHTML = stripHtmlTags(globalBooks[e.target.id.substr(e.target.id.length - 1)].description);
                });
            });

        }
    }
    ajax.open('GET', '/history/approved', true);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send();




}



