document.addEventListener("DOMContentLoaded", async () => {
    const booksContainer = document.querySelector(".books");

    // === MODALES ===
    const addBookModal = document.getElementById("addBookModal");
    const editBookModal = document.getElementById("editBookModal");

    const closeAddModal = document.getElementById("closeModal");
    const closeEditModal = document.getElementById("closeEditModal");

    const addBookBtn = document.querySelector(".add-book-btn");
    const addBookForm = document.getElementById("addBookForm");
    const editBookForm = document.getElementById("editBookForm");

    // Campos del modal de edición
    const editTitle = document.getElementById("editTitle");
    const editAuthor = document.getElementById("editAuthor");
    const editYear = document.getElementById("editYear");
    let currentEditId = null;

    // === FUNCIONES ===

    // Cargar todos los libros
    async function loadBooks() {
        booksContainer.innerHTML = "";

        try {
            const res = await fetch("http://backend-kevin:5000/books/");
            const books = await res.json();

            books.forEach(book => {
                const card = document.createElement("div");
                card.classList.add("book-card");
                card.id = book.id.value;

                card.innerHTML = `
                    <div class="book-image-container">
                        <img src="images/book.png" alt="Libro" class="book-image" />
                    </div>
                    <div class="book-info">
                        <p class="author">${book.author.value}</p>
                        <p class="title">${book.title.value}</p>
                        <p class="year">${book.publishedYear.value > 0 ? book.publishedYear.value : "Año desconocido"}</p>
                    </div>
                    <div class="book-actions">
                        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;

                // Botón editar
                card.querySelector(".edit-btn").addEventListener("click", () => {
                    openEditModal(book);
                });

                // Botón eliminar
                card.querySelector(".delete-btn").addEventListener("click", async () => {
                    const confirmDelete = confirm(`¿Eliminar "${book.title.value}"?`);
                    if (confirmDelete) {
                        await deleteBook(book.id.value);
                    }
                });

                booksContainer.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            alert("Error al cargar los libros");
        }
    }

    // === FOOTER MESSAGE ===
    async function loadFooterMessage() {
        const footerMessage = document.getElementById("footer-message");

        try {
            const res = await fetch("http://backend-kevin:5000/morales-perez");
            if (!res.ok) throw new Error("Error al obtener el mensaje");
            const text = await res.text(); // El endpoint devuelve texto plano
            footerMessage.textContent = text;
        } catch (err) {
            console.error(err);
            footerMessage.textContent = "No se pudo cargar el mensaje del servidor.";
        }
    }

    // Eliminar libro
    async function deleteBook(bookId) {
        try {
            const res = await fetch(`http://backend-kevin:5000/books/${bookId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                alert("Libro eliminado correctamente");
                await loadBooks();
            } else {
                const data = await res.json();
                alert(`Error al eliminar: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al eliminar");
        }
    }

    // Abrir modal de edición
    function openEditModal(book) {
        currentEditId = book.id.value;
        editTitle.value = book.title.value;
        editAuthor.value = book.author.value;
        editYear.value = book.publishedYear.value;

        editBookModal.style.display = "flex";
    }

    // Cerrar modales
    closeAddModal.addEventListener("click", () => addBookModal.style.display = "none");
    closeEditModal.addEventListener("click", () => editBookModal.style.display = "none");

    // Abrir modal de agregar
    addBookBtn.addEventListener("click", () => addBookModal.style.display = "flex");

    // Agregar libro
    addBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newBook = {
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            publishedYear: parseInt(document.getElementById("year").value)
        };

        try {
            const res = await fetch("http://backend-kevin:5000/books/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook)
            });

            if (res.ok) {
                alert("Libro agregado correctamente");
                addBookModal.style.display = "none";
                addBookForm.reset();
                await loadBooks();
            } else {
                const data = await res.json();
                alert(`Error al agregar: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error al agregar libro");
        }
    });

    // Editar libro (PUT)
    editBookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedBook = {
            title: editTitle.value,
            author: editAuthor.value,
            publishedYear: parseInt(editYear.value)
        };

        try {
            const res = await fetch(`http://backend-kevin:5000/books/${currentEditId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedBook)
            });

            if (res.ok) {
                alert("Libro actualizado correctamente");
                editBookModal.style.display = "none";
                await loadBooks();
            } else {
                const data = await res.json();
                alert(`Error al actualizar: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error al actualizar libro");
        }
    });

    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener("click", (e) => {
        if (e.target === addBookModal) addBookModal.style.display = "none";
        if (e.target === editBookModal) editBookModal.style.display = "none";
    });

    // Cargar libros al iniciar y footer
    await loadBooks();
    await loadFooterMessage();

});
