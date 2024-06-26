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

const drawableCanvas = new DrawableCanvas(canvas, socket)

socket.emit("join-room", { name: name, roomId: roomId })
socket.on("start-drawer", startRoundDrawer)
socket.on("start-guesser", startRoundGuesser)
endRound()
resizeCanvas()

readyButton.addEventListener("click", () => {
  hide(readyButton)
  socket.emit("ready")
})

window.addEventListener("resize", resizeCanvas())

function endRound() {
  hide(guessForm)
}

function hide(element) {
  element.classList.add("hide")
}

function show(element) {
  element.classList.remove("hide")
}

function startRoundDrawer(word) {
  wordElement.textContent = word
}

function startRoundGuesser() {
  show(guessForm)
}

function resizeCanvas() {
  canvas.width = null
  canvas.height = null

  const clientDimensions = canvas.getBoundingClientRect()
  canvas.width = clientDimensions.width
  canvas.height = clientDimensions.height
}
