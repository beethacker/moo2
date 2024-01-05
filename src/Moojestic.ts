enum MooPuzzleMode {
    COUNT_MODE,
    SLOT_MODE
}

enum MooScoreType {
    NONE,
    CORRECT, 
    SHIFT
}

class MooEntry {
    word: string 
    correct: number
    shifted: number
    mask?: MooScoreType[]

    constructor(word: string, correct: number, shifted: number, mask?: MooScoreType[]) {
        this.word = word
        this.mask = mask
        this.correct = correct
        this.shifted = shifted
    }

    matches(that: MooEntry, mode: MooPuzzleMode): boolean {
        if (mode == MooPuzzleMode.COUNT_MODE) {
            return (this.correct == that.correct) && (this.shifted == that.shifted)
        }
        else {
            if (this.mask === undefined || that.mask === undefined) {
                throw new Error("Mask should be set.... especially for that mode...TODO it should just always be set!")
            }
            for (let i = 0; i < this.mask!!.length; i++) {
                if (this.mask[i] != that.mask[i]) {
                    return false
                }
            }
            return true
        }
    }

    toString(): string {
        return "[CORRECT = " + this.correct + ", SHIFT = " + this.shifted + "]"
    }
}

function calcHistogram(word: string) : {[key: string]: number} {
    const result : {[key: string]: number} =  {}
    for (let i = 0; i < word.length; i++) {
        const c = word.charAt(i)
        result[c] = (result[c]  || 0) + 1
    }
    return result
}

// TODO handle double letters. scoreWord(hook, slow, COUNT_MODE) is wrong!
function scoreWord(solution: string, guess: string, mode: MooPuzzleMode) : MooEntry {
    let correct = 0
    let shifted = 0
    let mask = new Array(solution.length) 
    mask.fill(MooScoreType.NONE)

    let hist = calcHistogram(solution)

    for (let i = 0; i < solution.length; i++) {
        if (solution.charAt(i) == guess.charAt(i)) {
            correct++
            mask[i] = MooScoreType.CORRECT

            hist[solution.charAt(i)]--
        }
    }
   
    for (let i = 0; i < solution.length; i++) {
        const g = guess.charAt(i)
        if (hist[g] > 0) {
            hist[g]--
            shifted++
            mask[i] = MooScoreType.SHIFT
        }
    }

    return new MooEntry(guess, correct, shifted)
}

class MooPuzzle {
    solution: string
    clues: MooEntry[]
    mode: MooPuzzleMode

    constructor(mode: MooPuzzleMode, solution: string, entries: MooEntry[]) {
        this.solution = solution
        this.clues = entries
        this.mode = mode
    }
}

function randomWord(list: string[]) : string {
    const result = list[Math.floor(Math.random() * list.length)]
    return result
}

function matchesClue(solution: string, word: string, clue: MooEntry, mode: number): boolean {
    const score = scoreWord(solution, word, mode)
    return score.matches(clue, mode)
}
function genPuzzle(wordList: string[], bigWordList: string[], mode: MooPuzzleMode) : MooPuzzle | undefined{
    return tryGenPuzzle(wordList, bigWordList, mode)
}

function tryGenPuzzle(wordList: string[], bigWordList: string[], mode: MooPuzzleMode) : MooPuzzle | undefined {

    const maxAttempts = 10
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const solution = randomWord(wordList)
        const otherWords = bigWordList.filter(x => x != solution)
        let remaining = otherWords
        const clueEntries = []

        let debug = ["rub", "toe", "bee", "rub", "toe", "bee"]

        for (let i = 0; i < 6 && remaining.length > 0; i++) {
            const clueWord = randomWord(wordList)
            const clue = scoreWord(solution, clueWord, mode)

            clueEntries.push(clue)

            remaining = remaining.filter(w => matchesClue(clueWord, w, clue, mode))
        }

        if (remaining.length == 0) {
            return new MooPuzzle(mode, solution, clueEntries)
        }
    }
    return undefined
}

function findSolution(entries: MooEntry[]) : string | undefined {
    return undefined
}

export {MooPuzzle, MooEntry, MooPuzzleMode, genPuzzle }
//export more for debugging...
export {scoreWord, matchesClue}