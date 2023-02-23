let observer;
let omegleObserver;
let contextLevel = 0;
let tempStorage = {};
let wordList = [];

let contextArr = [
  intiateGame,
  menu,
  vote,
  select,
  game,
  gameEnd
];

let dialogObj = {
  initate: ['Hangman Omegle Game', 'Agree to play?', 'Type one of the following, semicolon included:\n;yes\n;no\n;help'],
  help: ['The game begins with both the host(player who initiated the game) and the stranger deciding who will be the hanger through vote.',
    'The hanger is the player who knows the secret word, they can either have one selected automatically or enter one their self.',
    'If the hanger is the stranger, any messages in relation to the secret word will be deleted on the host\'s end while the game is in progress.',
    'The guesser has a total of 6 guesses before losing the game. The hanger can ;forgive a mis-guess if they choose to.'],
  voting: ['Game offer accepted', 'Vote for who will be the hanger, the player that will decide and hold the secret word.', 'Options:\n;host\n;stranger\n;help'],

}

let config = {
  delay: 100,
  sendBtnSelector: '.sendbtn',
  messageSelector: '.chatmsg',
  dialogPrefix: '| '
};

function hangManLoop(mutationList, observer)
{
  mutationList.forEach(mutation => {

    const userMsgObj = checkLog(mutation, observer);
    
    if (!userMsgObj)
    {
      return;
    }

    if (userMsgObj.textContent == ';help')
    {
      runDialogTree(dialogObj.help)
      return;
    }

    const context = contextArr[contextLevel];
    if (context && context(userMsgObj) && contextLevel < contextArr.length - 1)
    {
      contextLevel++;
    }
  })
}

function intiateGame(userMsgObj)
{
  if (!(userMsgObj.logClass.contains('youmsg') && userMsgObj.textContent == ';begin'))
  {
    return;
  }
  runDialogTree(dialogObj.initate);

  return true;
}

function menu(userMsgObj)
{
  if (!(userMsgObj.logClass.contains('strangermsg')))
  {
    return;
  }

  if (userMsgObj.textContent == ';yes')
  {
    runDialogTree(dialogObj.voting)
    return true;
  }
  else if (userMsgObj.textContent == ';no')
  {
    contextLevel = 0;
    runDialog('Game offer rejected.')
  }
}

function vote(userMsgObj)
{
  if (!(userMsgObj.textContent == ';host') && !(userMsgObj.textContent == ';stranger'))
  {
    return;
  }

  tempStorage[userMsgObj.logClass] = userMsgObj.textContent;
  runDialog(`${userMsgObj.logClass == 'youmsg' ? 'Host' : 'Stranger'} votes for ${userMsgObj.textContent == ';host' ? 'Host' : 'Stranger'}`)

  if (!tempStorage['youmsg'] || !tempStorage['strangermsg'])
  {
    return;
  }

  if (tempStorage['youmsg'] == tempStorage['strangermsg'])
  {
    tempStorage['youmsg'] == ';host' ? tempStorage.hanger = 'youmsg' : tempStorage.hanger = 'strangermsg';
  }
  else
  {
    runDialog('Theres a draw! Now for a coin flip, Host heads, Stranger tails.');
    Math.random() > 0.49 ? tempStorage.hanger = 'youmsg' : tempStorage.hanger = 'strangermsg';
  }

  const hanger = tempStorage.hanger == 'youmsg' ? 'Host' : 'Stranger';

  runDialog(`The hanger is: the ${hanger}`);
  runDialog(`${hanger}, enter your secret word beginning with a semicolon.`);
  runDialog('Enter ;RANDOM for a word to automatically be selected.');
  setupHangerListener();

  return true;
}

function setupHangerListener()
{
  if (tempStorage.hanger == 'youmsg')
  {
    gameMsg("Press space after entering the secret word to submit it.")
    gameMsg("Pressing enter will reveal it to the stranger.")
    document.querySelector(config.messageSelector).addEventListener('input', hangerListener);
  }
}

function hangerListener(event)
{
  const input = event.target.value;

  if (!(input[0] == ';' && input[input.length - 1] == ' '))
  {
    return;
  }

  event.target.value = '';

  if (select({logClass: 'youmsg', textContent: input}))
  {
    document.querySelector(config.messageSelector).removeEventListener('input', hangerListener);
    contextLevel++;
  }
  else
  {
    gameMsg('The word must be longer than 1 letter and can\'t include special characters');
  }
}

function select(userMsgObj)
{
  if (tempStorage.random)
  {
    userMsgObj.span.textContent = '| SECRET WORD REMOVED';
    runDialog('Word chosen.')
    return true;
  }

  if (tempStorage.hanger != userMsgObj.logClass)
  {
    return;
  }

  const input = userMsgObj.textContent.split(' ')[0];

  if (!input[0] == ';' || input.length <= 1 || !/^;[a-zA-Z]+$/.test(input))
  {
    return;
  }

  if (input == ';RANDOM')
  {
    tempStorage.word = wordList[Math.floor(Math.random() * wordList.length)];
    
    if (tempStorage.hanger == 'strangermsg')
    {
      tempStorage.random = true;
      runDialog(`Your secret word is ${tempStorage.word}.`);
      return;
    }
    else
    {
      gameMsg(`Your secret word is ${tempStorage.word}.`);
    }
  }
  else
  {
    tempStorage.word = input.split(';')[1].toLowerCase();

    if (tempStorage.hanger == 'strangermsg')
    {
      userMsgObj.span.textContent = '| SECRET WORD REMOVED';
    }
  }

  runDialog('Word chosen.');
  setUpGame();

  return true;
}

function game(userMsgObj)
{
  let input = userMsgObj.textContent;
  let correct = false;

  if (input[0] != ';')
  {
    return;
  }

  input = input.split(';')[1].toLowerCase();

  if (userMsgObj.logClass == tempStorage.hanger && userMsgObj.textContent == ';forgive')
  {
    if (tempStorage.failCount > 0)
    {
      tempStorage.failCount--;
      runDialog(`A guess has been forgiven, ${6 - tempStorage.failCount} guesses remain.`);
    }
    else
    {
      runDialog('No guesses have been made yet.');
    }
    return;
  }

  if (userMsgObj.logClass == tempStorage.hanger)
  {
    return;
  }


  if (!/^[a-z]$/.test(input))
  {
    runDialog('Only enter one letter, eg. ;h.');
    return;
  }
  else if (tempStorage.letterGuesses.includes(input))
  {
    runDialog('Letter already guessed.')
    return;
  }

  tempStorage.letterGuesses.push(input);
  index = tempStorage.word.indexOf(input);
  
  tempStorage.word.split('').forEach((letter, index) => {
    if (letter == input)
    {
      correct = true;
      tempStorage.wordSlots[index] = input;
    }
  });


  if (correct)
  {
    runDialog('Guess was correct.')
  }
  else
  {
    tempStorage.failCount++;
    runDialog(`Guess was incorrect, ${6 - tempStorage.failCount} misses remain.`)
  }
  showGraphics();

  if (tempStorage.failCount == 6 || !tempStorage.wordSlots.includes('_'))
  {
    gameEnd();
    return true;
  }
}

function setUpGame()
{
  tempStorage.letterGuesses = [];
  tempStorage.failCount = 0;
  tempStorage.wordLength = tempStorage.word.length;
  tempStorage.wordSlots = new Array(tempStorage.wordLength).fill('_');
  showGraphics();
}

function showGraphics()
{
  runDialog(tempStorage.wordSlots.join(' '));
  runDialog('\n' + graphicsArr[tempStorage.failCount].join('\n'));
}

function gameEnd()
{
  observer.disconnect();
  if (tempStorage.failCount == 6)
  {
    runDialog(`The Hanger wins! The secret word was ${tempStorage.word}.`)
  }
  else
  {
    runDialog(`The guester wins! The secret word was ${tempStorage.word}.`)
  }
}

function gameMsg(msg)
{
  const log = document.querySelector('.logbox > div');
  const logItem = document.createElement('div');
  const para = document.createElement('p');
  const msgSource = document.createElement('strong');
  const span = document.createElement('span');

  logItem.classList.add('logitem');
  para.classList.add('strangermsg');
  msgSource.classList.add('msgsource');
  msgSource.textContent = 'Game: ';
  span.textContent = msg;

  log.appendChild(logItem);
  logItem.appendChild(para);
  para.appendChild(msgSource);
  para.appendChild(span);

  return logItem
}

function runDialogTree(dialog)
{
    for (let i = 0; i < dialog.length; i++)
    {
        setTimeout(() => {
            printToOmegle(config.dialogPrefix + dialog[i])
    }, i == 0 ? 0 : config.delay);
    }
}

function runDialog(dialog)
{
  printToOmegle(config.dialogPrefix + dialog)
}

function printToOmegle(msg)
{
  const textarea = document.querySelector(config.messageSelector);
  const sendBtn = document.querySelector(config.sendBtnSelector);
  const prevText = textarea.value;

  textarea.value = msg;
  sendBtn.click();
  textarea.value = prevText;
}

function start()
{
  if (!setupOmegle() === false)
  {
    return;
  }

  setUpObserver();
}

function setupOmegle()
{
  const target = document.querySelector('.inconversation');

  if (!target)
  {
    console.warn('Conversation area not found, observer not set.');
    return false;
  }

  if (omegleObserver)
  {
    omegleObserver.disconnect()
  }
  omegleObserver = new MutationObserver(setUpObserver);
  omegleObserver.observe(target, {childList: true, attributes: false})
}

function setUpObserver()
{
  const target = document.querySelector('.logbox > div');

  if (!target)
  {
    console.warn('Logbox not found, observer not set.');
    return false;
  }

  if (observer)
  {
    observer.disconnect();
  }
  observer = new MutationObserver(hangManLoop);
  observer.observe(target, {childList: true, attributes: false});
}

function checkLog(mutation, observer)
{
  const addedNodes = mutation.addedNodes;

  if (addedNodes.length < 1)
  {
    return;
  }
  const para = addedNodes[0].querySelector('p')

  if (!para)
  {
    return;
  }

  const logClassList =  para.classList;
  const span = para.querySelector('span');
  let textContent;

  if (logClassList.contains('statuslog') && para.textContent == 'Stranger has disconnected.' || para.textContent == 'You have disconnected.')
  {
    observer.disconnect();
    contextLevel = 0;
    tempStorage = {};
    console.warn('Chat ended.')
  }

  if (!span)
  {
    return;
  }

  textContent = span.textContent;

  return {logClass: logClassList[0], textContent, span};
}

const graphicsArr = [
  [
    "_____",
    "| - - - -]",
    "| - - - -",
    "| - - - -",
    "_____"
  ],
  [
    "_____",
    "| - - - O",
    "| - - - -",
    "| - - - -",
    "_____"
  ],
  [
    "_____",
    "| - - - O",
    "| - - -/-",
    "| - - - -",
    "_____"
  ],
  [
    "_____",
    "| - - - O",
    "| - - -/ |",
    "| - - - -",
    "_____"
  ],
  [
    "_____",
    "| - - - O",
    "| - - -/ | \\",
    "| - - - /",
    "_____"
  ],
  [
    "_____",
    "| - - - O",
    "| - - -/ | \\",
    "| - - - / \\",
    "_____"
  ]
];

wordList = [
  "quicker",
  "matching",
  "banding",
  "impinge",
  "shaping",
  "achievement",
  "deflated",
  "repeatable",
  "smothering",
  "industry",
  "communication",
  "iceland",
  "brainwashed",
  "specifying",
  "highlighting",
  "hysteria",
  "protracted",
  "remarks",
  "database",
  "absences",
  "tenacity",
  "inconvenience",
  "rummage",
  "wondrous",
  "graphics",
  "saturated",
  "divulged",
  "competencies",
  "suspect",
  "detecting",
  "mexican",
  "connectors",
  "forcing",
  "inertia",
  "reimbursement",
  "commando",
  "statistically",
  "arsenal",
  "memberships",
  "unreadable",
  "firepower",
  "quarterdeck",
  "attached",
  "screams",
  "precedence",
  "backpack",
  "dismisses",
  "swirling",
  "motivations",
  "welcomed",
  "controlled",
  "alleged",
  "compactor",
  "interject",
  "heartily",
  "billion",
  "decisively",
  "restful",
  "explication",
  "displays",
  "specializes",
  "unsatisfying",
  "chopped",
  "completing",
  "trashed",
  "remedial",
  "governmental",
  "admirably",
  "circular",
  "pervasive",
  "reflections",
  "bringing",
  "contractually",
  "registrations",
  "corroborating",
  "frightened",
  "watchdogs",
  "symposium",
  "patagonia",
  "legality",
  "departments",
  "diabolical",
  "instantaneously",
  "addressable",
  "jealousy",
  "remittance",
  "fluency",
  "renewals",
  "analytical",
  "flourishes",
  "disqualified",
  "upwardly",
  "papered",
  "grandchild",
  "swaziland",
  "pilgrimage",
  "endangers",
  "railroad",
  "contact",
  "anecdotes"
];

start();