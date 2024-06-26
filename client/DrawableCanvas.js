export default function DrawableCanvas(canvas, socket) {
  let prevPosition = null

  canvas.addEventListener("mousemove", (e) => {
    if (e.buttons !== 1) {
      prevPosition = null
      return
    }

    const newPosition = { x: e.layerX, y: e.layerY }

    if (prevPosition != null) {
      drawLine(prevPosition, newPosition)

      socket.emit("draw", {
        start: normalizeCoordinates(prevPosition),
        end: normalizeCoordinates(newPosition),
      })
    }

    prevPosition = newPosition
  })

  canvas.addEventListener("mouseleave", () => (prevPosition = null))

  socket.on("draw-line", (start, end) => {
    drawLine(toCanvasSpace(start), toCanvasSpace(end))
  })

  function drawLine(start, end) {
    const canvasContext = canvas.getContext("2d")

    canvasContext.beginPath()
    canvasContext.moveTo(start.x, start.y)
    canvasContext.lineTo(end.x, end.y)
    canvasContext.stroke()
  }

  function normalizeCoordinates(position) {
    return {
      x: position.x / canvas.width,
      y: position.y / canvas.height,
    }
  }

  function toCanvasSpace(position) {
    return {
      x: position.x * canvas.width,
      y: position.y * canvas.height,
    }
  }
}
