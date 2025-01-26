let db

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BookManagerDB", 1)

    request.onerror = (event) => reject("Error opening database")

    request.onsuccess = (event) => {
      db = event.target.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = event.target.result
      const objectStore = db.createObjectStore("books", { keyPath: "id", autoIncrement: true })
      objectStore.createIndex("title", "title", { unique: false })
      objectStore.createIndex("author", "author", { unique: false })
    }
  })
}

const addBook = (title, author) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readwrite")
    const objectStore = transaction.objectStore("books")
    const request = objectStore.add({ title, author })

    request.onerror = (event) => reject("Error adding book")
    request.onsuccess = (event) => resolve(event.target.result)
  })
}

const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readonly")
    const objectStore = transaction.objectStore("books")
    const request = objectStore.getAll()

    request.onerror = (event) => reject("Error fetching books")
    request.onsuccess = (event) => resolve(event.target.result)
  })
}

const displayBooks = async () => {
  const books = await getAllBooks()
  const bookList = document.getElementById("book-list")
  bookList.innerHTML = ""

  books.forEach((book) => {
    const li = document.createElement("li")
    li.textContent = `${book.title} by ${book.author}`
    bookList.appendChild(li)
  })
}

document.addEventListener("DOMContentLoaded", async () => {
  await openDatabase()
  displayBooks()

  const form = document.getElementById("add-book-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const title = document.getElementById("title").value
    const author = document.getElementById("author").value

    await addBook(title, author)
    form.reset()
    displayBooks()
  })
})

