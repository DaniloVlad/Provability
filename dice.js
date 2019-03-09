const crypto = require("crypto");

const HEADS = 0
const TAILS = 1
const MAXBETS = 4

const aes256 = (key, salt, iv) => {
  //randomize data a bit more
  //dont rely on the company for true random number generation. Prevent pre-image attacks
  let cipher = crypto.createCipher("aes256", salt);
  if(iv) cipher = crypto.createCipheriv("aes256", salt, iv);
  return cipher.update(key).toString("hex")
}

//returns random 256 bit string
const genServerSeed = (callback) => {
  var seed;
  if(callback) {
    crypto.randomBytes(32, callback)
  } else {
    seed = crypto.randomBytes(32);
    return seed
  }
}

const genBetSig = (key, salt, iv, callback) => {
  //return object
  const res = {bets: "", sig: ""};
  let cipher;
  if(key && salt && iv && typeof iv !== 'function') 
    cipher = aes256(key, salt, iv);
  else 
    cipher = aes256(key, salt)
  
  hmac = crypto.createHmac("sha256", salt);
  //leave as buffer
  res.bets = hmac.update(cipher).digest('hex');
  //convert bet string to hex for consistent types
  res.sig = crypto.createHash("sha256").update(res.bets).digest("hex");

  if(callback) 
    callback(res)
  else 
    return res
}

const placeBet = (bet, bstring) => {
  //bet logic here
  //use betstring to generate roll
  const roll = parseInt(bstring,16);
  console.log('HEX: '+bstring);
  console.log('Decimal: '+roll);
  const scale = ((100 * roll) / (Math.pow(2, 20)-1)); //scale to [0, 100]
  return {bet: bet == HEADS ? scale < 49.50 : scale > 50.50, roll: scale}

}

const verify = (serverSeed, salt, iv, signature, callback) => {
  //you had the salt, signature, and just got the server seed
  let cipher;
  //this step is to ensure the server isnt using known hashes
  if(serverSeed && salt && iv && signature && signature !== 'function') cipher = aes256(serverSeed, salt, iv);
  else {
    //still server seed should not actually be used for the betting only to generate the bets
    cipher = aes256(serverSeed, salt);
    signature = iv;
  }
  //set up hash/hmac
  const hash = crypto.createHash("sha256")
  const hmac = crypto.createHmac("sha256", salt);
  return hash.update(hmac.update(cipher).digest("hex")).digest("hex") === signature
}

const GameInit = (salt, iv=null) => {
  this.serverSeed = genServerSeed();
  this.salt = salt || crypto.randomBytes(32);
  this.iv = iv;
  this.betString = genBetSig(this.serverSeed, this.salt, this.iv);

  if(!this.salt || !this.serverSeed || !this.betString) 
    throw new Error("not initialized...");
  this.cwin = 0;
  this.lwin = 0;
  this.bets = [];
  //for testing
  this.run = (index = this.bets.length) => {
    for(let b=index; b<this.betString.bets.length; b+=5) {
      const stance = Math.floor(Math.random()*2); //[0, 1]
      let win = placeBet(stance, this.betString.bets.substring(b, b+5))
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll})
      if(win.bet) 
        this.cwin += 1;
      else 
        this.lwin += 1;

    }
    console.log("All bets:\n", this.bets)
    console.log("Done betting, wins: ", this.cwin, " Loses: ", this.lwin)
    process.exit(0);
  };
  //place bet
  this.place = (stance) => {
    const index = this.bets.length*5;
    if(index >= MAXBETS) 
      return GameInit(crypto.randomBytes(32)).place(stance);
    else {
      let win = placeBet(stance, this.betString.bets.substring(index, index+5));
      this.bets.push({stance: stance == HEADS ? "heads" : "tails", win: win.bet, outcome: win.roll})
      if(win.bet) this.cwin += 1;
      else this.lwin += 1;
    }
    return this;
  };

  return this;
}

module.exports = {GameInit, HEADS, TAILS}
