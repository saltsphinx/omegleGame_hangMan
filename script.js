let observer;
let omegleObserver;
const config = {
  delay: 250,
  sendBtnSelector: '.sendbtn',
  messageSelector: '.chatmsg'
};

function runDialog(dialog)
{
    for (let i = 0; i < dialog.length; i++)
    {
        setTimeout(() => {
            printToOmegle('| Game bot:\n' + dialog[i])
    }, i == 0 ? 0 : 500);
    }
}

function printToOmegle(msg)
{
  const textarea = document.querySelector(config.messageSelector);
  const sendBtn = document.querySelector(config.sendBtnSelector);
  const prevText = textarea.value;

  console.log({textarea, sendBtn, prevText, msg})
  textarea.value = msg;
  sendBtn.click();
  textarea.value = prevText;
}

function start()
{

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
  observer = new MutationObserver(checkLog);
  observer.observe(target, {childList: true, attributes: false});
}

function checkLog(mutationList, observer)
{
  mutationList.forEach(mutation => {
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
      console.warn('Chat ended.')
    }

    if (!span)
    {
      return;
    }

    textContent = span.textContent;

    if (logClassList.contains('strangermsg'))
      printToOmegle(textContent)

    return {logClassList: logClassList[0], textContent};
  })
}