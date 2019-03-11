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
1) Generate the server seed & salt, which is kept secret (256-bits & 128 - bit)
2) User | Server generates secret key which both have a copy of (not so secret) (128 - bits)
3) OPTIONAL: user generates and submits randomization vector/IV (should be done)
4) Server:
```  
  IV = randVector
  serverSeed =  IV ? aes256(data = serverSeed, password = secretKey, iv = IV) : aes256(key = serverSeed, password = secretKey)
  BetString = sha256(key = serverSeed, salt = salt)
  sig = sha256(BetString)
```
5) After this the server sends the user the SIG and uses the bytes in BetString to generate bets
6) Now you need to decide on a range and scaling system:
```
  [min, max] roll = [0, 2^20-1]
  [a, b] scaledRange = [0, 100]
  scale(x) = (((b - a) * (x - min)) / (max-min)) + a
```
7) Why 2^20? We use 5 characters from the server seed, 5 chars * 4 bits/chars = 20 bits.
You could as easily of used 1 byte and the range would be [0..255].  The problem being the step
size between the generated numbers and the betting range.
```
  For 8-bits: 0=>0, 1=> 0.392, 2=>0.784, ... , 255=> 100.
  For 20-bits: 0=>0, 1=> 0.0000954, 2=> 0.0001907, ... , 2^20=> 100 
```

More Problems: This will still result in uneven scaling because 2^20 is not a multiple of 100.  However if
the 20-bit number is larger than 1 000 000 (max: 1 048 576) skip it and read the next 5 bytes.  This
would also change how you scale you would just divide by 1000. 

8) When betting the house uses the next 20-bits of the string each time until the user updates either
the secret or IV, or the house has used up the string.
9) Once betting is complete, the server sends the user the seed & key it generated in set 1


Verifying bets
-------------
1) Take the server seed
2) Follow step 4 from above to generate the BetString and SIG
3) Compare SIGS
4) Proceed to check the BetString for each bet.
5) see below! 

Sample Output
-------------
Output of normal play: 
```
Server gave signature: 5218a6254e04978f6b63cdde193e493b70038372627451371f84df3e0aa56be2
Initial Balance > 1000
Balance: 1000
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
LOST: 10
Position: heads | Roll: 56.94385237107503 0x91C6B
Wins: 0 Loses: 1
Balance: 990
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 30.86703383162864 0x4F050
Wins: 1 Loses: 1
Balance: 1000
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 46.589132870800846 0x7744A
Wins: 2 Loses: 1
Balance: 1010
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 13.776220108242137 0x23446
Wins: 3 Loses: 1
Balance: 1020
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 19.869441861574042 0x32DDA
Wins: 4 Loses: 1
Balance: 1030
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 47.60346184107002 0x79DD6
Wins: 5 Loses: 1
Balance: 1040
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 47.52163650668765 0x79A7C
Wins: 6 Loses: 1
Balance: 1050
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Heads 10
WON: 10
Position: heads | Roll: 4.772190830412703 0x0C378
Wins: 7 Loses: 1
Balance: 1060
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Tails 1000
LOST: 1000
Position: tails | Roll: 6.150251531840832 0x0FBEA
Wins: 7 Loses: 2
Balance: 60
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Tails 20
LOST: 20
Position: tails | Roll: 50.4992966645209 0x81473
Wins: 7 Loses: 3
Balance: 40
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> Tails 20
Verifying:
	Server Seed: 9605c0a7bd7bea8829d86cb35a0fbdd61a5ef2c03980bad69b635c31795b3eb9
	Salt: 59a88d5c7adb66d5d8709345966750bd19dd344d302d9eae30ccb641dbbc1fc2
	IV: 1edcf8bc38278f6d53c3b33f52258246
	Signature: 5218a6254e04978f6b63cdde193e493b70038372627451371f84df3e0aa56be2
We generated:
	Signature: 5218a6254e04978f6b63cdde193e493b70038372627451371f84df3e0aa56be2
All bets:
 [ { stance: 'heads',
    win: false,
    outcome: 56.94385237107503,
    hex: '91c6b' },
  ...
  { stance: 'tails',
    win: false,
    outcome: 50.4992966645209,
    hex: '81473' } ]
Wins:  7  Loses:  3
Was the server honest? yes
Server gave signature: daa05cfa8f2ad6594486e4e717652c7a70edc0fc920902a567da06135b1db34d
WON: 20
Position: tails | Roll: 81.11246215101447 0xCFA5D
Wins: 8 Loses: 3
Balance: 60
Enter Heads (under 49.50) or Tails (over 50.50) and a bet amount (ie: Heads 10)> 
Thanks for playing!
```

Output of run:
```
Server gave signature: d49a0ad6612ec00dd491b8e00bc52e62fe8c22bc4dc62ef41a14056c1d15cc81
Initial Balance > 1000
Balance: 1000
Enter Heads or Tails and a bet amount (ie: Heads 10)> run
Verifying:
	Server Seed: b06778f02a57ad5e72c6b9a8a10b796177bc2c40b55c2ca00b84e2921045b791
	Salt: 39b48706aa496d2a7b4fa7a7fb25df7b02acc9ddd40c12b94a2d6329bd0618f2
	IV: 9c733a129ab24984d28ce8e447e51240
	Signature: d49a0ad6612ec00dd491b8e00bc52e62fe8c22bc4dc62ef41a14056c1d15cc81
We generated:
	Signature: d49a0ad6612ec00dd491b8e00bc52e62fe8c22bc4dc62ef41a14056c1d15cc81
All bets:
 [ { stance: 'heads',
    win: false,
    outcome: 65.72863171446964,
    hex: 'a843e' },
  { stance: 'heads',
    win: true,
    outcome: 24.459480723839498,
    hex: '3e9dc' },
  { stance: 'tails',
    win: true,
    outcome: 92.0291824619126,
    hex: 'eb983' },
  { stance: 'tails',
    win: false,
    outcome: 31.814128698471734,
    hex: '5171b' },
  { stance: 'heads',
    win: false,
    outcome: 55.24592899887943,
    hex: '8d6df' },
  { stance: 'heads',
    win: true,
    outcome: 13.650239610900508,
    hex: '22f1d' },
  { stance: 'heads',
    win: false,
    outcome: 51.00932217533319,
    hex: '82957' },
  { stance: 'heads',
    win: false,
    outcome: 65.29203919605179,
    hex: 'a725c' },
  { stance: 'heads',
    win: true,
    outcome: 28.400543594878766,
    hex: '48b49' },
  { stance: 'tails',
    win: false,
    outcome: 27.850368357056006,
    hex: '474c0' },
  { stance: 'tails',
    win: false,
    outcome: 46.85043988269795,
    hex: '77efe' },
  { stance: 'heads',
    win: false,
    outcome: 90.54831557113225,
    hex: 'e7cdb' },
  { stance: 'heads',
    win: true,
    outcome: 4.688458145578523,
    hex: 'c00a' } ]
Wins:  5  Loses:  8
Was the server honest? yes

```