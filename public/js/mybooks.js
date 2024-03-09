let globalBooks = [];



window.onload = function() {  


    

    let counter = 0;
    ajax.onreadystatechange = () =>{
        if(ajax.readyState == 4 && ajax.status == 200){
            globalBooks = JSON.parse(ajax.responseText);
            let mainDiv = document.getElementById('main-card-div');

            let books = globalBooks;

            books.forEach(book => {
                

                mainDiv.innerHTML += `
                    <article id="book-${counter}" class="brick entry" data-animate-el>
                        <div class="entry__thumb">
                            <a href="single-standard.html" class="thumb-link">
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
                                <p id="text-${counter}">
                                    ${book.description.substring(0,400)}... <b><a id="button-${counter}" class="read-more-button" class="entry__more-link">Show more</a></b>
                                </p>
                            </div>
                            
                        </div> <!-- end entry__text -->
                    </article> <!-- end article -->
                `
                counter += 1;
            });

            const buttons = document.querySelectorAll('.read-more-button');
 
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                   e.target.style.display = 'none';    
                   let paragraph = document.getElementById(`text-${e.target.id.substr(e.target.id.length - 1)}`);
                    paragraph.innerHTML += globalBooks[e.target.id.substr(e.target.id.length - 1)].description.substring(400);
                });
            });

        }
    }
    ajax.open('GET', '/history/approved',true);
    ajax.setRequestHeader('Content-Type', 'application/json');  
    ajax.send();     




  }

  
 
