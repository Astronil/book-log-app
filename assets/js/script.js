import { database, ref, set, get, child, remove, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const bookList = document.getElementById("books");
  const filterGenre = document.getElementById("filter-genre");
  const sortBy = document.getElementById("sort-by");

  bookForm.addEventListener("submit", addBook);
  filterGenre.addEventListener("change", filterBooks);
  sortBy.addEventListener("change", sortBooks);

  loadBooks();

  function addBook(e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const genre = document.getElementById("genre").value;
    const review = document.getElementById("review").value;
    const rating = document.getElementById("rating").value;

    const bookId = Date.now().toString();
    const bookRef = ref(database, `books/${bookId}`);
    set(bookRef, {
      title,
      author,
      genre,
      review,
      rating: parseInt(rating),
    })
      .then(() => {
        alert("Book added successfully!");
        bookForm.reset();
        loadBooks();
      })
      .catch((error) => {
        console.error("Error adding book:", error);
      });
  }

  function loadBooks() {
    const booksRef = ref(database, "books");
    get(child(booksRef, "/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const books = snapshot.val();
          displayBooks(
            Object.entries(books).map(([id, book]) => ({ ...book, id }))
          );
        } else {
          bookList.innerHTML = "<li>No books found.</li>";
        }
      })
      .catch((error) => {
        console.error("Error loading books:", error);
      });
  }

  function displayBooks(books) {
    bookList.innerHTML = "";
    books.forEach((book) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Rating:</strong> ${book.rating} stars</p>
                <p><strong>Review:</strong> ${book.review}</p>
                <button class="edit-btn" data-id="${book.id}">Edit</button>
                <button class="delete-btn" data-id="${book.id}">Delete</button>
            `;
      bookList.appendChild(li);
    });

    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((button) => {
      button.addEventListener("click", editBook);
    });

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", deleteBook);
    });
  }

  function editBook(e) {
    const bookId = e.target.getAttribute("data-id");
    const bookRef = ref(database, `books/${bookId}`);
    get(bookRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const book = snapshot.val();
          document.getElementById("title").value = book.title;
          document.getElementById("author").value = book.author;
          document.getElementById("genre").value = book.genre;
          document.getElementById("review").value = book.review;
          document.getElementById("rating").value = book.rating;

          bookForm.removeEventListener("submit", addBook);
          bookForm.addEventListener("submit", (e) => {
            e.preventDefault();
            update(bookRef, {
              title: document.getElementById("title").value,
              author: document.getElementById("author").value,
              genre: document.getElementById("genre").value,
              review: document.getElementById("review").value,
              rating: parseInt(document.getElementById("rating").value),
            })
              .then(() => {
                alert("Book updated successfully!");
                bookForm.reset();
                bookForm.addEventListener("submit", addBook);
                loadBooks();
              })
              .catch((error) => {
                console.error("Error updating book:", error);
              });
          });
        }
      })
      .catch((error) => {
        console.error("Error getting book:", error);
      });
  }

  function deleteBook(e) {
    const bookId = e.target.getAttribute("data-id");
    const bookRef = ref(database, `books/${bookId}`);
    remove(bookRef)
      .then(() => {
        alert("Book deleted successfully!");
        loadBooks();
      })
      .catch((error) => {
        console.error("Error deleting book:", error);
      });
  }

  function filterBooks() {
    const genre = filterGenre.value;
    const booksRef = ref(database, "books");
    get(child(booksRef, "/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let books = Object.entries(snapshot.val()).map(([id, book]) => ({
            ...book,
            id,
          }));
          if (genre !== "all") {
            books = books.filter((book) => book.genre === genre);
          }
          displayBooks(books);
        } else {
          bookList.innerHTML = "<li>No books found.</li>";
        }
      })
      .catch((error) => {
        console.error("Error filtering books:", error);
      });
  }

  function sortBooks() {
    const sortByValue = sortBy.value;
    const booksRef = ref(database, "books");
    get(child(booksRef, "/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let books = Object.entries(snapshot.val()).map(([id, book]) => ({
            ...book,
            id,
          }));
          if (sortByValue === "title") {
            books.sort((a, b) => a.title.localeCompare(b.title));
          } else if (sortByValue === "author") {
            books.sort((a, b) => a.author.localeCompare(b.author));
          } else if (sortByValue === "rating") {
            books.sort((a, b) => b.rating - a.rating);
          }
          displayBooks(books);
        } else {
          bookList.innerHTML = "<li>No books found.</li>";
        }
      })
      .catch((error) => {
        console.error("Error sorting books:", error);
      });
  }
});
