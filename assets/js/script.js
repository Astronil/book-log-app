import {
  booksRef,
  push,
  onValue,
  remove,
  update,
  ref,
  db,
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const booksList = document.getElementById("books");
  const filterGenre = document.getElementById("filter-genre");
  const filterStatus = document.getElementById("filter-status");
  const sortBy = document.getElementById("sort-by");
  const searchInput = document.querySelector(".search-bar input");

  // Add book function
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newBook = {
      title: document.getElementById("title").value,
      author: document.getElementById("author").value,
      genre: document.getElementById("genre").value,
      readStatus: document.getElementById("readStatus").value,
      review: document.getElementById("review").value,
      rating: document.getElementById("rating").value,
      dateAdded: new Date().toISOString(),
    };

    // Push to Firebase
    push(booksRef, newBook)
      .then(() => {
        bookForm.reset();
        alert("Book added successfully!");
      })
      .catch((error) => {
        console.error("Error adding book:", error);
        alert("Error adding book. Please try again.");
      });
  });

  // Load and display books
  onValue(booksRef, (snapshot) => {
    const books = snapshot.val();
    displayBooks(books);
  });

  // Display books function
  function displayBooks(books) {
    booksList.innerHTML = "";

    if (!books) return;

    let filteredBooks = Object.entries(books).map(([id, book]) => ({
      id,
      ...book,
    }));

    // Apply filters
    const genreFilter = filterGenre.value;
    const statusFilter = filterStatus.value;
    const searchTerm = searchInput.value.toLowerCase();

    filteredBooks = filteredBooks.filter((book) => {
      const matchesGenre = genreFilter === "all" || book.genre === genreFilter;
      const matchesStatus =
        statusFilter === "all" || book.readStatus === statusFilter;
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm);
      return matchesGenre && matchesStatus && matchesSearch;
    });

    // Sort books
    const sortValue = sortBy.value;
    filteredBooks.sort((a, b) => {
      if (sortValue === "dateAdded") {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
      return a[sortValue].localeCompare(b[sortValue]);
    });

    // Create book elements
    filteredBooks.forEach((book) => {
      const li = document.createElement("li");
      li.className = `book-item ${book.readStatus}`;
      li.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Status:</strong> ${book.readStatus}</p>
                ${
                  book.rating
                    ? `<p><strong>Rating:</strong> ${"⭐".repeat(
                        book.rating
                      )}</p>`
                    : ""
                }
                ${
                  book.review
                    ? `<p><strong>Review:</strong> ${book.review}</p>`
                    : ""
                }
                <div class="book-actions">
                    <button onclick="updateReadStatus('${book.id}')">
                        <span class="material-icons">auto_stories</span>
                        Update Status
                    </button>
                    <button onclick="deleteBook('${
                      book.id
                    }')" class="delete-btn">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
      booksList.appendChild(li);
    });
  }

  // Add event listeners for filters
  filterGenre.addEventListener("change", () => displayBooks(snapshot.val()));
  filterStatus.addEventListener("change", () => displayBooks(snapshot.val()));
  sortBy.addEventListener("change", () => displayBooks(snapshot.val()));
  searchInput.addEventListener("input", () => displayBooks(snapshot.val()));

  // Update read status
  window.updateReadStatus = async (bookId) => {
    const bookRef = ref(db, `books/${bookId}`);
    const statuses = ["to-read", "reading", "read"];

    onValue(
      bookRef,
      (snapshot) => {
        const book = snapshot.val();
        const currentIndex = statuses.indexOf(book.readStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        update(bookRef, {
          readStatus: nextStatus,
        });
      },
      { onlyOnce: true }
    );
  };

  // Delete book
  window.deleteBook = async (bookId) => {
    if (confirm("Are you sure you want to delete this book?")) {
      const bookRef = ref(db, `books/${bookId}`);
      await remove(bookRef);
    }
  };
});
