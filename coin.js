const crypto = require("crypto");

const HEADS = 0
const TAILS = 1
const MAXBETS = 10 // 256 bits/bet-string / 20 bits/bet

const aes256 = (seed, key, iv) => {
  //randomize data a bit more
  //dont rely on the company for true random number generation. 
  //Prevent pre-image attacks
  let cipher = crypto.createCipheriv("aes256", key, iv);
  return cipher.update(seed).toString("hex")
}

//returns random 256 bit string
const genServerSeed = () => {
  var seed = crypto.randomBytes(32);
  return seed
}

const genBetSig = (seed, key, iv, salt) => {
  let cipher, sig, bets, hmac;
  cipher = aes256(seed, key, iv);
  hmac = crypto.createHmac("sha256", salt);
  bets = hmac.update(cipher).digest("hex");
  //here no salt should be used
  sig = crypto.createHash("sha256").update(bets).digest("hex");

  return {bets, sig}
}

const placeBet = (bet, bstring) => {
  //bet logic here
  //use betstring to generate roll
  const roll = parseInt(bstring, 16);
  const scale = ((100 * roll) / (Math.pow(2, 20) - 1)); //scale to [0, 100]
  return { 
    bet: bet == HEADS ? scale < 49.50 : scale > 50.50, 
    roll: scale, 
    hex: bstring
  }

}

const verify = (serverSeed, key, iv, salt, signature) => {
  //you had the iv, key & signature 
  //you just got the server seed & salt
  const cipher = aes256(serverSeed, key, iv);
  //set up hmac
  const hmac = crypto.createHmac("sha256", salt);
  const bets = hmac.update(cipher).digest('hex');

  const hash = crypto.createHash("sha256");
  //generate signature the same way the server did
  const sig = hash.update(bets).digest('hex');
  console.log("We generated:\n\tSignature: " + sig);
  //compare generated and give signatures
  return sig === signature;
}

const GameInit = (key = null, iv = null) => {
  //server seed & salt would be private. The client would have iv & key & the signature
  this.serverSeed = genServerSeed();
  this.salt = crypto.randomBytes(32);
  //key should be generated using a safer method than this using a password hashing func
  //tht works on user input 
  this.key = key || crypto.randomBytes(32);
  this.iv = iv || crypto.randomBytes(16);
  this.betString = genBetSig(this.serverSeed, this.key, this.iv, this.salt);
  this.wins = 0;
  this.loses = 0;
  this.bets = [];

  console.log("Server gave signature: " + this.betString.sig.toString('hex'))
  if(!this.salt || !this.iv || !this.serverSeed || !this.betString) 
    throw new Error("not initialized...");
  
  this.run = () => {
    //used to test the functions automatically
    const index = this.bets.length * 5;
    for(let b = index; b < this.betString.bets.length; b += 5) {
      const stance = Math.floor(Math.random() * 2); //[0, 1]
      let win = placeBet(stance, this.betString.bets.substring(b, b + 5));
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll, hex: win.hex});
      win.bet === true ? this.wins++ : this.loses++;
    }
    this.verify();
    process.exit(0);
  };
  
  this.place = (stance) => {
    //place bet
    const index = this.bets.length * 5;
    if(this.bets.length >= MAXBETS) {
      this.verify();
      return GameInit().place(stance);  //new instance
    }
    else {
      let win = placeBet(stance, this.betString.bets.substring(index, index + 5));
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll, hex: win.hex})
      win.bet === true ? this.wins++ : this.loses++;
    }

    return this;
  };

  this.verify = () => {
    console.log("Verifying:"+
    "\n\tServer Seed: "+this.serverSeed.toString('hex')
    +"\n\tSalt: "+this.salt.toString('hex')
    +"\n\tIV: "+this.iv.toString('hex')
    +"\n\tSignature: "+this.betString.sig.toString('hex'));

    const check = verify(this.serverSeed, this.key, this.iv, this.salt, this.betString.sig);
    
    console.log("All bets:\n", this.bets)
    console.log("Wins: ", this.wins, " Loses: ", this.loses);
    console.log("Was the server honest? "+(check === true ? "yes" : "no"));
    return;
  }

  return this;
}

module.exports = {GameInit, HEADS, TAILS}
