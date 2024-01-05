import React from "react"
import { MooEntry, MooPuzzle, MooPuzzleMode } from "./Moojestic"

interface MooCanvasProps {
    height: number
    width: number
    puzzle?: MooPuzzle 
}

function drawBlankTile(ctx: CanvasRenderingContext2D, sizing: {width: number, height: number}, style: {fg: string, bg: string}, x: number, y: number) {
    ctx.fillStyle = style.bg
    ctx.strokeStyle = style.fg
    ctx.lineWidth = 3
    
    const radius = 10
    const width = sizing.width
    const height = sizing.height
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    ctx.lineTo(x + radius, y + height)
    ctx.arcTo(x, y + height, x, y + height - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
}

function drawCorrect(ctx: CanvasRenderingContext2D, sizing: {width: number, height: number}, style: {fg: string, bg: string}, x: number, y: number) {
    drawBlankTile(ctx, sizing, style, x, y)
}

function drawLetterTile(ctx: CanvasRenderingContext2D, letter: string, sizing: {width: number, height: number}, style: {fg: string, bg: string}, x: number, y: number) {
    drawBlankTile(ctx, sizing, style, x, y)

    ctx.font = 'bold 32px Roboto'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = style.fg
    ctx.fillText(letter, x + sizing.width / 2, y + sizing.height / 2)
}

function drawCountMode(ctx: CanvasRenderingContext2D) {

}

function computeWidth(puzzle: MooPuzzle, tileSize: {width: number}, padTile: number, hintSize: {width: number}, padHint: number) : number {
    const numLetters = puzzle.clues[0].word.length
    let result = numLetters * (tileSize.width + padTile)

    if (puzzle.mode == MooPuzzleMode.COUNT_MODE) {
        let n = 0
        for (let c of puzzle.clues) {
            if (c.correct > n) n = c.correct
            if (c.shifted > n) n = c.shifted
        }

        if (n > 0) {
            result += n * hintSize.width
            result += (n - 1)*padHint
        }
    }
    return result
}

const TILE_SIZE = {width: 55, height: 65}
const MINI_SIZE = {width: 20, height: 20}
const PLAIN_TILE = {fg: "#111", bg: "#ddd"}
const CORRECT_TILE = {fg: "#161", bg: "#dfd"}
const MOVED_TILE = {fg: "#816", bg: "#ffcafa"}

const MooCanvas: React.FC<MooCanvasProps> = ({width, height, puzzle}: MooCanvasProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null)

    React.useEffect(() => {
        if (canvasRef.current) {
            contextRef.current = canvasRef.current.getContext("2d")
        }

        if (contextRef.current) {
            let ctx = contextRef.current

            ctx.fillStyle = "#383c44"
            ctx.fillRect(0, 0, width, height)

            let y = 50
            if (puzzle) {

                const padTile = 10
                const padScore = 5
                const reqWidth = computeWidth(puzzle, TILE_SIZE, padTile, MINI_SIZE, padScore)

                const clues = puzzle.clues
                const startX = (width - reqWidth)/2

                for (let w = 0; w < clues.length; w++) {
                    let x = startX
                    const upper = clues[w].word.toUpperCase()
                    for (let i = 0; i < upper.length; i++) {
                        const tileLetter = upper.charAt(i)
                        drawLetterTile(ctx, tileLetter, TILE_SIZE, PLAIN_TILE, x, y)
                        x += TILE_SIZE.width + padTile
                    }
                    const scoreStartX = x

                    //Draw correct
                    for (let i = 0; i < clues[w].correct; i++) {
                        drawCorrect(ctx, MINI_SIZE, CORRECT_TILE, x, y)
                        x += MINI_SIZE.width + padScore
                    }

                    x = scoreStartX
                    for (let i = 0; i < clues[w].shifted; i++) {
                        drawCorrect(ctx, MINI_SIZE, MOVED_TILE, x, y + MINI_SIZE.height + padScore)
                        x += MINI_SIZE.width + padScore
                    }

                    //Draw shifted
                    y += TILE_SIZE.height + padTile

                }
            }

            // drawLetterTile(ctx, "B", TILE_SIZE, PLAIN_TILE, 100, 100)
            // drawLetterTile(ctx, "R", TILE_SIZE, PLAIN_TILE, 100, 160)
            // drawLetterTile(ctx, "O", TILE_SIZE, PLAIN_TILE, 100, 220)
            // drawLetterTile(ctx, "D", TILE_SIZE, CORRECT_TILE, 160, 100)
            // drawLetterTile(ctx, "I", TILE_SIZE, MOVED_TILE, 160, 160)
        }
    })

    return <div className="moo-canvas-div">
        <canvas
            ref = {canvasRef}
            width = {width}
            height = {height}
        />
    </div>
}

export default MooCanvas