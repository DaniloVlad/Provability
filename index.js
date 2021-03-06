const readln = require("readline");
var { GameInit, HEADS, TAILS } = require("./coin");

var game = GameInit();
var balance = 0, wins = 0, loses = 0;
//config i/o
const rl = readln.createInterface({
  input: process.stdin,
  output: process.stdout
});
//request starting balance
rl.setPrompt("Initial Balance > ");
rl.prompt();
//input handler
rl.on('line', (answer) => {
  //format answer
  if(balance == 0) {
    balance = parseFloat(answer, 10);
    console.log("Balance: "+balance);
    if(!isNaN(balance))
      rl.setPrompt("Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> ");
    else 
      balance = 0;
  }
  else {
    if(answer == 'run')
      return game.run();
    else if(answer == 'quit') {
      return;
    }
    else {
      answer = answer.trim().split(" ");
      const stance = answer[0].toLowerCase();
      const amount = parseFloat(answer[1], 10);
      if(amount > balance || isNaN(amount)) {
        console.log("Invalid amount!");
        return;
      }
      //defaults to head
      stance === 'tails' ? game = game.place(TAILS) : game = game.place(HEADS);
      const result = game.bets[0 || game.bets.length - 1];
      if(result.win) {
        wins++;
        balance += amount;
        console.log("Win: " + amount);
      }
      else {
        loses++;
        balance -= amount;
        console.log("Loss: " + amount);
        balance === 0 ? r1.setPrompt("Initial Balance >") : 0 ;
      }
      //notify user of the details
      console.log("Position: " + stance + " | Roll: " + result.outcome + " 0x" + result.hex.toUpperCase());
      console.log("Wins: " + wins + " Loses: " + loses);
      console.log("Balance: "+balance);
    }
  }
  rl.prompt();
});
//run verify
rl.on('close', () => console.log("\nThanks for playing!"))
