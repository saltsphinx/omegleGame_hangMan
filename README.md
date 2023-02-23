# omegleGame_hangMan
Hangman is a guessing game played between two people, where one person plays as the hanger, and the other the hangee. The hanger comes up with a word that they believe the guesser will struggle to figure out, and the guesser has 6 chances to figure the word out before being hung,AKA. losing the game.

This particular version is played on Omegle with another player by entering words into the chat box beginning with semicolons. It's meant for omegles chat feature, but it might work for video chats also.

## How to use
Head to [script.js](./script.js) and copy all of its contents. Then head to omegle and start a text conversation. Open the developer console, through shortcut you can with Ctrl + Alt + J or K depending on browser and operating system, or by pressing F12 and nevigating to the console in the upper tool bar. Then, paste the code into the console, and type either ;begin to open the game menu or ;help to get an idea of the game and some of its features. If for some reason the commands don't work, enter start() into the dev console and things should work fine afterwards.

## Notes
This was a project idea I got from chatting with someone on Omegle. It was my first time doing something like this, and I rushed it quite a bit, so sorry for its absolute abysmal design. There are some coherent parts that can be extracted and used in other projects, like the hangManLoop(), setUpObserver(), and checkLog() functions that allow you to phrase omegle messages and disconnect the observer when the chat ends. If you'd like to use the code in your projects, you can in any way you'd like, I just ask that you contact me so I can see whatever cool things you've created! I tried my best to iron out any obvious bugs, but some definitely still exist.