Provability examples and Explanation
-------------

_Quickly wrote this up for a friend to explain proofs for online gambling_


What is Provability?
-------------
Provability is loosely defined online as a model for being able "to prove that..."
- [Wikipedia](https://en.wikipedia.org/wiki/Provability_logic "Provability")


Why is it important?
-------------
Imagine gambling online, where your choice of game is a coin flip. The company
claims to have a house edge of 1% and your bets are done as follows.
You bet over/under for 49.50/50.50 respectively.
```
Heads -> [0, 49.50)
Tails -> (50.50, 100]
House edge -> [49.50, 50.50]
edge % =  1 - (total range - house range)/(total range)
ex: bet tails -> edge = 1 - (50 - .5)/50 = 1 - 0.99 = 0.01
or
bet tails -> e = 1 - (100 - 1)/100...
```
However, what stops the company from generating any numbers and just informing you of
the bet results ? Provability.

Coin Implementation
-------------

Heres the model:
1) Generate the server seed, which is kept secret (256-bits)
2) User | Server generates secret key which both have a copy of (not so secret) (128 - bits)
3) OPTIONAL: user generates and submits randomization vector/IV
4) Server:
```  
  IV = randVector
  serverSeed =  IV ? aes256(key=serverSeed, password=salt, iv=IV) : aes256(key=serverSeed, password=salt)
  BetString = sha256(key = serverSeed, salt=secretKey)
  sig = sha256(BetString)
```
5) After this the server sends the user the SIG and uses the bytes in BetString to generate bets
6) Now you need to decide on a range and scaling system:
```
  [min, max] roll = [0, 2^20-1]
  [a, b] scaledRange = [0, 100]
  scale(x) = (((b-a)*(x-min))/(max-min)) + a
```
7) Why 2^20? Because the generated bet string will be digested in hex, 5chars*4 bits/chars= 20 bits.
You could as easily of used 1 byte/8 bits and the range would be [0..255].  The problem being the step
size between the generated numbers and the betting range.
```
  For 8-bits: 0=>0, 1=> 0.392, 2=>0.784, ... , 255=> 100.
  For 20-bits: 0=>0, 1=> 0.0000954, 2=> 0.0001907, ... , 2^20=> 100 
```
More Problems: This will still result in uneven scaling because 2^20 is not a multiple of 100.  However if
the 20-bit number is larger than 1 000 000 (max: 1 048 576) skip it and read the next 5 bytes.  This
would also change how you scale you would just divide by 1000.

8) When betting the house uses the next 5 bytes of the string each time until the user updates either
the secret or IV, or the house has used up the string.
9) Once betting is complete, the server sends the user the seed it generated in set 1


Verifying bets
-------------
1) Take the server seed
2) Follow step 4 from above to generate the BetString and SIG
3) Compare SIGS
4) Proceed to check the BetString for each bet.

Sample Output
-------------
Output of normal play: 
```
node index
Initial Balance > 1000
Balance: 1000
Enter Heads or Tails and a bet amount (ie: Heads 10)> heads 10
HEX: 94d97
Decimal: 609687
Position: under 49.50/heads, Amount: 10, Result: 58.14433874544024
Wins: 0, Loses: 1, Balance: 990
Enter Heads or Tails and a bet amount (ie: Heads 10)> heads 10
HEX: 8207f
Decimal: 532607
Position: under 49.50/heads, Amount: 10, Result: 50.79341010418902
Wins: 0, Loses: 2, Balance: 980
Enter Heads or Tails and a bet amount (ie: Heads 10)> heads 100
HEX: e5fda
Decimal: 942042
Position: under 49.50/heads, Amount: 100, Result: 89.84021171590015
Wins: 0, Loses: 3, Balance: 880
Enter Heads or Tails and a bet amount (ie: Heads 10)> heads 200
HEX: 252f2
Decimal: 152306
Position: under 49.50/heads, Amount: 200, Result: 14.525045895620247
Wins: 1, Loses: 3, Balance: 1080
Enter Heads or Tails and a bet amount (ie: Heads 10)> 

```

Output of run:
```
Enter Heads or Tails and a bet amount (ie: Heads 10)> run
HEX: 52f2e
Decimal: 339758
HEX: 234a1
Decimal: 144545
HEX: d4c86
Decimal: 871558
HEX: 3ed40
Decimal: 257344
HEX: 4e2b9
Decimal: 320185
HEX: 0241b
Decimal: 9243
HEX: d0975
Decimal: 854389
HEX: e0902
Decimal: 919810
HEX: 35245
Decimal: 217669
HEX: 61c91
Decimal: 400529
HEX: 97b87
Decimal: 621447
HEX: 32018
Decimal: 204824
HEX: 4f7
Decimal: 1271
All bets:
 [ { stance: 'heads', win: true, outcome: 14.525045895620247 },
  { stance: 'heads', win: true, outcome: 32.40187874019502 },
  { stance: 'tails', win: false, outcome: 13.784898552797845 },
  { stance: 'heads', win: false, outcome: 83.11832725365377 },
  { stance: 'heads', win: true, outcome: 24.542259733447775 },
  { stance: 'heads', win: true, outcome: 30.535250220537396 },
  { stance: 'tails', win: false, outcome: 0.8814820113010514 },
  { stance: 'heads', win: false, outcome: 81.48096225830294 },
  { stance: 'heads', win: false, outcome: 87.72000095367522 },
  { stance: 'tails', win: false, outcome: 20.758553274682306 },
  { stance: 'heads', win: true, outcome: 38.19745845552297 },
  { stance: 'tails', win: true, outcome: 59.26586081110078 },
  { stance: 'heads', win: true, outcome: 19.53355744701142 },
  { stance: 'heads', win: true, outcome: 0.12121212121212122 } ]
Done betting, wins:  8  Loses:  6

```