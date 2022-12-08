const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key'])
        resolve(decodedKey)
      }
    })
  })
}

const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0].id;
  
      chrome.tabs.sendMessage(
        activeTab,
        { message: 'inject', content },
        (response) => {
          if (response.status === 'failed') {
            console.log('injection failed.');
          }
        }
      );
    });
  };

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey()
  const url = 'https://api.openai.com/v1/completions'

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  })

  // Select the top choice and send back
  const completion = await completionResponse.json()
  return completion.choices.pop()
}

const generateCompletionAction = async (info) => {
  try {
    sendMessage('generating...');

    const { selectionText } = info
    const basePromptPrefix = `
    Tell me a story of a historical figure in close combat with Genghis Khan. They should fight in a gladiator's arena. They will be given random weapons. The story should describe their strikes and parries. If possible, the aspect of their historical significance should factor into who wins the fight. The fight must have a randomly chosen winner, and result in the brutal death of the loser. The last line should be it's own paragraph, and simply say "Winner!" if Genghis Khan lost, and "Loser!" if Genghis Khan won.
    Combatant:
      `

    
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`)

    //If I want to do multiple prompts
    // const secondPrompt = `
    //   Take the table of contents and title of the blog post below and generate a blog post written in thwe style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.
      
    //   Title: ${selectionText}
      
    //   Table of Contents: ${baseCompletion.text}
      
    //   Blog Post:
    //   `;

    // // Call your second prompt
    // const secondPromptCompletion = await generate(secondPrompt);

    //console.log(baseCompletion.text)
    //sendMessage(secondPromptCompletion.text);
    sendMessage(baseCompletion.text);
  } catch (error) {
    console.log(error)
    sendMessage(error.toString());
  }
}

chrome.contextMenus.create({
  id: 'context-run',
  title: 'Fight Genghis Khan!',
  contexts: ['selection'],
})

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction)
