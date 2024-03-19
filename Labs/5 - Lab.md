# Hash Length Extension Attack Lab

The objective of this lab is to help students understand how the length extension attack works.

MAC is calculated from a secret key and a message. A naive way to calculate MAC is to concatenate the key with the message and calculate the one way hash of the resulting string. This method seems to be fine, but it is subject to an attack called length extension attack, which allows attackers to modify the message while still being able to generate a valid MAC based on the modified message, without knowing the secret key.

## Task 1: Send Request to List Files



## Task 2: Create Padding



## Task 3: The Length Extension Attack



## Task 4: Attack Mitigation using HMAC

