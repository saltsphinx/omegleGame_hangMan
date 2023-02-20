let observer;
const config = {
  delay: 250,
  sumbitSelector: '.sendbtn',
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
  const textarea = document.querySelector('.chatmsg');
  const prevText = textarea.value;

  textarea.value = msg;
  document.querySelector('.sendbtn').click()
  textarea.value = prevText;
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

    if (span)
    {
      textContent = span.textContent;
    }

    if (logClassList.contains('statuslog') && para.textContent == 'Stranger has disconnected.' || para.textContent == 'You have disconnected.')
    {
      observer.disconnect();
      console.warn('Chat ended.')
    }

    if (logClassList.contains('strangermsg'))
      printToOmegle(textContent)
  })
}