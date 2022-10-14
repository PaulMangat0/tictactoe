(function() {

/******************************* UTILS ******************************************************** */

//Help method to create 2D arrays  //JS 2D array
create2DArray = function(r,h) {
  var finalArray = []; 
  for(let i=0;i<r;i++) { 
    var tempArray=[];
    for(let j=0;j<h;j++) {
      tempArray.push("");
    }
    finalArray.push(tempArray);
  }
  return finalArray;
}

/******************************* PERSON CLASS ******************************************************** */
//Player Class 

class Player {
  constructor(name) {
    this.score = 0;
    this.name = name;
    this.state = 'inactive'; //not playing
  }
  getName() { return this.name; }
  setName(name) { this.name=name; }
  addPoints(n) { this.score+=n; }
  getScore() { return this.score; }
  resetScore() { this.score=0; }
  getState() { return this.state; }
  nextState = function() { this.state = this.state==='inactive' ? 'active' : 'inactive'; }

}

class AIPlayer extends Player {
  constructor(name,moveLogic) {
    super(name);
    this.makeMove = moveLogic;
  } 
}

// b = new AIPlayer('mark',() => {console.log('hi');})
// console.log({b});
// b.makeMove();

/******************************* GAMEBOARD MODULE ******************************************************** */

const TICTACTOEGameBoard = (function() {

  //INITIALIZE GAMEBOARD - CREATE 2D ARRAY, Add Listeners
  let state = 'inactive'; //playing - interface would be good i think? js ?
  function getState() { return state; };
  function nextState() { state = (state ==='inactive' ? 'active' : 'inactive');}

  //Grab all DOM elements
  const gameBoard = document.querySelector("#gameboard");

  //Create 2D array
  const board=create2DArray(3,3);

  //Put DOM ref and initial values into 2D array
  let count = 0;
  for(let i=0;i<3;i++) {
    for(let j=0;j<3;j++) {
     board[i][j]=[gameBoard.children[count],''];  //store reference and value (X,O,.) 
     gameBoard.children[count].addEventListener('click',handleSelection); //add listeners to board
     count++;
    }
  }

  //INITIALIZE GAME STATE

  //create players - make method (bind to scoreboard later)
  const playerOne = new Player("Player X");
  const playerTwo = new Player("Player O");
  playerOne.nextState(); //playerOne is now 'active'; (playing)
 
  resetBoard(); //reset board


  // FUNCTIONS

  //Update Emitter updon Score change
  function emitScoreChange() {
    let playerScores = new Map();
    playerScores.set(playerOne.getName(),playerOne.getScore());
    playerScores.set(playerTwo.getName(),playerTwo.getScore());
    VanillaEventEmitter.trigger("scoresChanged",playerScores); //map playername:score
  }

  //reset game board
  function resetBoard() {
    for(let i=0;i<3;i++) {
      for(let j=0;j<3;j++) {
      board[i][j][1]='';  //reset all X,Os to .
      board[i][j][0].innerHTML='';
      }
    }
    emitScoreChange();
  }

  //Gets array coordinates based on data-id #
  function getArrayCoords(spotNumberSelected) {
    i = Math.floor(spotNumberSelected / 3);
    j = spotNumberSelected % 3;
    return {i,j};
  }

  //Checks for valid move
  function checkValidMove (i,j) {
    return (board[i][j][1]==='' ? true : false);
  }

  //Assign a move to the array
  function applyMove(i,j,symbol) {
    board[i][j][1]=symbol;
    board[i][j][0].innerHTML=symbol;
  }

  //Check if a win has occured
  function checkForWin() {

    //check horz/vert
    for(let i=0;i<3;i++) {
    if(board[i][0][1]===board[i][1][1] && board[i][1][1]===board[i][2][1] && board[i][2][1]!=='' ) {
      return board[i][1][1];
      }
    }
    for(let j=0;j<3;j++) {
      if(board[0][j][1]===board[1][j][1] && board[1][j][1]===board[2][j][1] && board[2][j][1]!=='' ) {
        return board[1][j][1];
      }
    }

    //check diags
    if( (board[0][0][1]===board[1][1][1] && board[1][1][1]===board[2][2][1]) ||
        (board[2][0][1]===board[1][1][1] && board[1][1][1]===board[0][2][1]  && board[1][1][1]!=='' )  ) {
      return board[1][1][1];
    }

    //check for draw
    draw=true;
    for(let i=0;i<3;i++) {
      for(let j=0;j<3;j++) {
        if(board[i][j][1]==='') {draw=false};  //spot is available
      }
    }
    if (draw) {return 'D';} //draw game

    //no win
    return '';

  }


  //MAIN GAME LOGIC - upon player selection 
  function handleSelection() {

    //get array coords from selected DOM element
    playerMove = getArrayCoords(this.getAttribute("data-id")); 
    
    //Check validity of Move
    if (state==='inactive' | checkValidMove(playerMove.i,playerMove.j)===false) {return}; //quit if spot has been played or game inactive

    //Apply symbol to array and DOM
    symbol = playerOne.getState()==='active' ? 'X' : 'O';
    applyMove(playerMove.i,playerMove.j,symbol);

    //check for win/draw (change state or continue)
    symbol = checkForWin();

    if (symbol==='D') {  //draw game
      state='inactive';
      console.log("draw game"); 
      console.log(playerOne.getName() + ":" + playerOne.getScore());
      console.log(playerTwo.getName() + ":" + playerTwo.getScore());

    } else if(symbol==='') { //no winner yet
      playerOne.nextState();
      playerTwo.nextState();
    
    } else { //win occured
      state='inactive';
      if (symbol==='X') {playerOne.addPoints(1);}
      else {playerTwo.addPoints(1);}
      emitScoreChange();

      console.log("winner"); 
      console.log(playerOne.getName() + ":" + playerOne.getScore());
      console.log(playerTwo.getName() + ":" + playerTwo.getScore());

    }
  }
    return{playerOne,playerTwo,reset : resetBoard,getState,nextState};
  })();


  /******************************* Interface MODULE ******************************************************** */
  const TICTACTOEInterface = (function() {

    //INITIALIZE 

    //Grab all DOM elements
    const startButton = document.querySelector("#start-button");
    const resetButton = document.querySelector("#reset-button");
    const p1TextField = document.querySelector("#p1-name");
    const p2TextField = document.querySelector("#p2-name");

    //Add Listener
    startButton.addEventListener('click',startGame);
    resetButton.addEventListener('click',resetGame);
     
    //Reset Button Handler
    function resetGame() {
      TICTACTOEGameBoard.reset();
      if (TICTACTOEGameBoard.getState() === 'active') { 
        TICTACTOEGameBoard.nextState(); 
      }
      p1TextField.disabled=false;
      p2TextField.disabled=false;
      startButton.disabled=false;
    }

    //Start Button Handler
    function startGame() {

      if (TICTACTOEGameBoard.getState() === 'inactive') {
        TICTACTOEGameBoard.nextState();
        if (p1TextField.value=='') {
          p1TextField.value='Player X';
        }
        if (p2TextField.value=='') {
          p2TextField.value='Player O';
        }
          
        TICTACTOEGameBoard.playerOne.setName(p1TextField.value);      
        TICTACTOEGameBoard.playerTwo.setName(p2TextField.value);
        p1TextField.disabled=true;
        p2TextField.disabled=true;
        startButton.disabled=true;
      }
    }
  })();

})();
