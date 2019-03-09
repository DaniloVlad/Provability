Provability examples and Explanation
-------------

_Quickly wrote this up for a friend to explain proofs for online gambling_


What is Provability?
-------------
Provability is loosely defined online as a model for being able "to prove that..."
- [Wikipedia](https://en.wikipedia.org/wiki/Provability_logic "Provability")


Why is it important?
-------------
Imagine gambling online, where your choice of game is a dice flip. The company
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

Dice Implementation
-------------
Rolling with the dice implementation. Ha.
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
the 20-bit number is larger than 1 000 000 (max: 1 048 576) skip it and read the next 5 bytes.
8) When betting the house uses the next byte of the string each time until the user updates either
the secret or IV, or the house has used up the string.
9) Once betting is complete, the server sends the user the seed it generated in set 1


Verifying bets
-------------
1) Take the server seed
2) Follow step 4 from above to generate the BetString and SIG
3) Compare SIGS
4) Proceed to check the BetString for each bet.
