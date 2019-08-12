- a program state can only stored in reducers
- the real actions can only be produced from microtask queue


- if one action generates a new state in several places at once?
-- one action should not cause a conflict in different stores
-- one action must have the same execution mark in different stores


- what is the difference between internal and external reducers?