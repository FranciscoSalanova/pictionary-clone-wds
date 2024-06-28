import { io } from "socket.io-client"
import DrawableCanvas from "./DrawableCanvas"

const production = process.env.NODE_ENV === "production"
const serverURL = production ? "realsite.com" : "http://localhost:3000"

const URLParams = new URLSearchParams(window.location.search)
const name = URLParams.get("name")
const roomId = URLParams.get("room-id")

if (!name || !roomId) window.location = "/index.html"

const socket = io(serverURL)

const guessForm = document.querySelector("[data-guess-form]")
const guessInput = document.querySelector("[data-guess-input]")
const canvas = document.querySelector("[data-canvas]")
const wordElement = document.querySelector("[data-word]")
const messagesElement = document.querySelector("[data-messages]")
const readyButton = document.querySelector("[data-ready-btn]")
const guessTemplate = document.querySelector("[data-guess-template]")

const drawableCanvas = new DrawableCanvas(canvas, socket)

socket.emit("join-room", { name: name, roomId: roomId })
socket.on("start-drawer", startRoundDrawer)
socket.on("start-guesser", startRoundGuesser)
socket.on("guess", displayGuess)
socket.on("winner", endRound)
endRound()
resizeCanvas()
setupHTMLEvents()

function setupHTMLEvents() {
  readyButton.addEventListener("click", () => {
    hide(readyButton)
    socket.emit("ready")
  })

  guessForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (guessInput.value === "") return

    socket.emit("make-guess", { guess: guessInput.value })
    displayGuess(name, guessInput.value)

    guessInput.value = ""
  })

  window.addEventListener("resize", resizeCanvas())
}

function displayGuess(guesserName, guess) {
  const guessElement = guessTemplate.content.cloneNode(true)
  const nameElement = guessElement.querySelector("[data-name]")
  const messageElement = guessElement.querySelector("[data-text]")

  nameElement.innerText = guesserName
  messageElement.innerText = guess
  messagesElement.append(guessElement)
}

function endRound(name, word) {
  if (name && word) {
    wordElement.innerText = word
    show(wordElement)
    displayGuess(null, `${name} is the winner!`)
  }

  drawableCanvas.canDraw = false
  hide(guessForm)
  show(readyButton)
}

function hide(element) {
  element.classList.add("hide")
}

function show(element) {
  element.classList.remove("hide")
}

function startRoundDrawer(word) {
  drawableCanvas.clearCanvas()
  messagesElement.innerHTML = ""
  wordElement.textContent = word

  drawableCanvas.canDraw = true
}

function startRoundGuesser() {
  drawableCanvas.clearCanvas()
  wordElement.innerText = ""
  hide(wordElement)
  messagesElement.innerHTML = ""

  show(guessForm)
}

function resizeCanvas() {
  canvas.width = null
  canvas.height = null

  const clientDimensions = canvas.getBoundingClientRect()
  canvas.width = clientDimensions.width
  canvas.height = clientDimensions.height
}
