/******************************* SCOREBOARD MODULE *************************************************** */
//Scoreboard Module

const scoreboard = (function() {

  //map to score all player scores
  const scores = new Map();

  //Grab all DOM elements
  const scoreboard = document.querySelector("#scoreboard");
  const playerList = scoreboard.querySelector("#player-list");
  const playerScoreTemplate = scoreboard.querySelector("#player-score-template");
  const playerScoreHtml = playerScoreTemplate.innerHTML;

  //BindEvents
    VanillaEventEmitter.subscribe("scoresChanged",updateAllScores);
  
  //Render HTML
  function _render() {
    playerList.innerHTML="";
    
    scores.forEach((value,key) => {
      var cloneHTML = playerScoreHtml;
      cloneHTML=cloneHTML.replace("{{player-name}}",key);
      cloneHTML=cloneHTML.replace("{{player-score}}",value);
      playerList.innerHTML+=cloneHTML;
    });
  }

  function updateAllScores(newScoresMap) {
    newScoresMap.forEach( (value,key) => {
      scores.set(key,value);        
    });
  
    _render();
  }

  //Access Methods
  function addPlayer(name) {
    scores.set(name,0);
  }

  function update(name,score) {
    scores.set(name,score);
  }

  function reset() {
    scores.values.array.forEach(score => {
      score=0;
    });
  }

  function clear() {
    scores.clear;
  }

 
})();