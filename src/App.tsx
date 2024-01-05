import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import MooCanvas from './MooCanvas';
import { MooPuzzle, MooPuzzleMode, genPuzzle, scoreWord } from './Moojestic';

function App() {
  let easyWords = []
  let hardWords = []
  let [puzzle, setPuzzle] = React.useState<MooPuzzle | undefined>()
  let [showAnswer, setShowAnswer] = React.useState<boolean>(false)
  let [showNewPopup, setShowNewPopup] = React.useState<boolean>(true)
  let [wordSize, setWordSize] = React.useState<number>(0)

  let [showTests, setShowTests] = React.useState<boolean>(false)
  let [trigger, setTrigger] = React.useState<number>(1)

  useEffect(() => {
    if (wordSize > 0) {
      console.log("Loading dictionary...")
      //TODO, ummm, cache these! :)
      fetch(`/data/easy_dict/words_${wordSize}.txt`).then(function (response) {
        return response.text()
      }).then(function (easy) {
        fetch(`/data/big_dict/words_${wordSize}.txt`).then(function (response) {
          return response.text()
        }).then(function (big) {
          easyWords = easy.split("\n").map(x => x.trimEnd())
          hardWords = big.split("\n").map(x => x.trimEnd())
          setShowAnswer(false)
          setPuzzle(genPuzzle(easyWords, hardWords, MooPuzzleMode.COUNT_MODE))

        }).catch(err => {
          console.log("Error fetching dictionary:")
        })
      }).catch(err => {
        console.log("Error fetching dictionary:")
      })
    }
  }, [trigger])

  // let testBtn = <button className="moo-button" onClick={()=>setShowTests(!showTests)}>Toggle Show Tests</button>
  let newBtn = <button className="moo-button" onClick={()=>setShowNewPopup(!showNewPopup)}>New</button>

  let popupClass = "modal-popup " + (showNewPopup ? "" : "hidden")
  let answerPopupClass = "modal-popup " + (showAnswer ? "" : "hidden")
  let bgBlurClass = "blur-bg " + ((showNewPopup || showAnswer) ? "" : "hidden")

  let newPuzzle = (n : number) => {
    setWordSize(n)
    setTrigger(trigger + 1)
    setShowNewPopup(false)
  }

    //see https://www.makeuseof.com/popup-window-html-css-javascript-create/
  return (
    <div className="App">

    <div className={popupClass}>
      <div className="modal-content">
          <div className="modal-header">
            <h3>Create New Puzzle</h3>
            <button className="close-modal" onClick={()=>setShowNewPopup(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div> <span>Number of Letters: </span><br/>
              <button className="moo-button" onClick={() => newPuzzle(3)}> 3 </button>
              <button className="moo-button" onClick={() => newPuzzle(4)}> 4 </button>
              <button className="moo-button" onClick={() => newPuzzle(5)}> 5 </button>
              <button className="moo-button" onClick={() => newPuzzle(6)}> 6 </button>
            </div>
          </div>
      </div>
    </div>
    <div className={answerPopupClass}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Answer: {puzzle?.solution}</h3>
            <button className="close-modal" onClick={()=>setShowAnswer(false)}>&times;</button>
          </div>
        </div>
    </div>
      <div className={bgBlurClass}></div>

      {newBtn}
      <button className="moo-button" onClick={()=>setShowAnswer(true)}>Show Answer </button> 

      <MooCanvas width={600} height={700} puzzle={puzzle}/>
    </div>
  );
}

export default App;
