const crypto = require("crypto");

const HEADS = 0
const TAILS = 1
const MAXBETS = 4 //

const aes256 = (key, salt, iv) => {
  //randomize data a bit more
  //dont rely on the company for true random number generation. 
  //Prevent pre-image attacks
  let cipher = crypto.createCipher("aes256", salt);
  if(iv) 
    cipher = crypto.createCipheriv("aes256", salt, iv);

  return cipher.update(key).toString("hex")
}

//returns random 256 bit string
const genServerSeed = (callback) => {
  var seed;
  if(callback) {
    crypto.randomBytes(32, callback)
  } 
  else {
    seed = crypto.randomBytes(32);
    return seed
  }
}

const genBetSig = (key, salt, iv) => {
  let cipher, sig, bets, hmac;
  cipher = aes256(key, salt, iv);
  hmac = crypto.createHmac("sha256", salt);
  bets = hmac.update(cipher).digest('hex');
  sig = crypto.createHash("sha256").update(bets).digest("hex");

  return {bets, sig}
}

const placeBet = (bet, bstring) => {
  //bet logic here
  //use betstring to generate roll
  const roll = parseInt(bstring,16);
  const scale = ((100 * roll) / (Math.pow(2, 20)-1)); //scale to [0, 100]
  return { 
    bet: bet == HEADS ? scale < 49.50 : scale > 50.50, 
    roll: scale, 
    hex: bstring
  }

}

const verify = (serverSeed, salt, iv, signature) => {
  console.log("Verifying:"+
    "\n\tServer Seed: "+serverSeed.toString('hex')
    +"\n\tSalt: "+salt.toString('hex')
    +"\n\tIV: "+iv.toString('hex')
    +"\n\tSignature: "+signature.toString('hex'));
  //you had the salt, signature, and just got the server seed
  const cipher = aes256(serverSeed, salt, iv);
  //set up hash/hmac
  const hash = crypto.createHash("sha256")
  const hmac = crypto.createHmac("sha256", salt);
  const bets = hmac.update(cipher).digest('hex');
  const sig = hash.update(bets).digest('hex');
  console.log("We generated:\n\tSignature: "+sig);
  return sig === signature;
}

const GameInit = (salt = null, iv = null) => {
  this.serverSeed = genServerSeed();
  this.salt = salt || crypto.randomBytes(32);
  this.iv = iv || crypto.randomBytes(16);
  this.betString = genBetSig(this.serverSeed, this.salt, this.iv);
  this.wins = 0;
  this.loses = 0;
  this.bets = [];

  if(!this.salt || !this.iv || !this.serverSeed || !this.betString) 
    throw new Error("not initialized...");
  
  this.run = () => {
    //used to test the functions automatically
    const index = this.bets.length * 5;
    for(let b = index; b < this.betString.bets.length; b += 5) {
      const stance = Math.floor(Math.random() * 2); //[0, 1]
      let win = placeBet(stance, this.betString.bets.substring(b, b + 5));
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll});
      win.bet === true ? this.cwin++ : this.lwin++;
    }
    console.log("All bets:\n", this.bets)
    console.log("Done betting, wins: ", this.cwin, " Loses: ", this.lwin)
    var check = verify(this.serverSeed, this.salt, this.iv, this.betString.sig);
    console.log("The server generated bets (truthfully) random: "+check);
    process.exit(0);
  };
  
  this.place = (stance) => {
    //place bet
    const index = this.bets.length * 5;
    if(index >= MAXBETS) 
      return GameInit().place(stance);
    else {
      let win = placeBet(stance, this.betString.bets.substring(index, index + 5));
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll})
      win.bet === true ? this.cwin++ : this.lwin++;
    }
    return this;
  };
  return this;
}

module.exports = {GameInit, HEADS, TAILS}
