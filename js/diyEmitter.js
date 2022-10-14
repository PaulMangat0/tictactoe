/******************************* EVENT EMITTER MODULE*************************************************** */
// dIY Event Emitter 

const VanillaEventEmitter = (function() {
  'use strict';
  const watchList = {}; //eventName : [handlers,..]
 
   //add an event-handler
   const subscribe = function(eventName,handler) {
    if(watchList[eventName]===undefined) {
      watchList[eventName]=[handler];
    }else if (!watchList[eventName].includes(handler)) {
      watchList[eventName].push(handler);
     }    
    //  console.log(watchList);
  } 

  //remove an event-handler
  const unsubscribe = function(eventName,handler) {
    if(watchList[eventName]!==undefined) {
      if(watchList.length===1) {
        delete watchList[eventName];
      }else {
        watchList[eventName]=watchList[eventName].splice(watchList[eventName].indexOf(handler),1);
      }
    }
  }  

  //update all upon event fired
  const trigger = function(eventName, newValue) {
    watchList[eventName].forEach( (fn) => {
      fn(newValue);  } );
   } 

     return{subscribe, unsubscribe, trigger};
})();