const readln = require("readline");
var { GameInit, HEADS, TAILS } = require("./coin");

var x = GameInit();
var balance = 0;
var wins = 0, loses = 0;

var cmds = ['quit', 'heads', 'tails', 'run']
//config i/o
const rl = readln.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt("Initial Balance > ");
rl.prompt();

rl.on('line', (answer) => {
  //format answer
  if(balance == 0) {
    balance = parseFloat(answer, 10);
    console.log(`Balance: ${balance}`);

    if(!isNaN(balance))
      rl.setPrompt("Enter Heads or Tails and a bet amount (ie: Heads 10)> ");
    else 
      balance = 0;
  }
  else {
    if(answer == 'run')
      return x.run();

    answer = answer.trim().split(" ");
    const stance = answer[0].toLowerCase();
    const amount = parseFloat(answer[1],10);

    if(amount <= balance && cmds.includes(stance)) {
      //handle inputs
      switch(stance) {
        case 'quit': 
          break;
        case 'tails': 
          x = x.place(TAILS); 
          break;
        case 'heads': 
          x = x.place(HEADS); 
          ;
      }
      const result = x.bets[0 || x.bets.length-1]
      if(result.win) {
        wins++;
        balance += amount;
      }
      else {
        loses++;
        balance -= amount;
      }
      if(balance == 0) 
        rl.setPrompt("Initial Balance > ");

      console.log(`Position: ${stance == 'tails' ? 'over 50.50/tails'  : 'under 49.50/heads'}, Amount: ${amount}, Result: ${result.win ? 'win' : 'loss', result.outcome}`)
      console.log(`Wins: ${wins}, Loses: ${loses}, Balance: ${balance}`)

    } else console.log("Not enough balance...")
  }
  rl.prompt();
});
//run verify
rl.on('close', () => console.log(''))
