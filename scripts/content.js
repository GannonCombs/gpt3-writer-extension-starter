const insertCalmly = (content) => {
    // Find Calmly editor input section
    const elements = document.getElementsByClassName('droid');

    if (elements.length === 0) {
        return;
    }

    const element = elements[0];
  
    // Grab the first p tag so we can replace it with our injection
    const pToRemove = element.childNodes[0];
    pToRemove.remove();
  
    // Split content by \n
    const splitContent = content.split('\n');
  
    // Wrap in p tags
    splitContent.forEach((content) => {
    const p = document.createElement('p');
  
    if (content === '') {
      const br = document.createElement('br');
      p.appendChild(br);
    } else {
      p.textContent = content;
    }
  
    // Insert into HTML one at a time
    element.appendChild(p);
  });
  
    // On success return true
    return true;
  };

  const insertGoogleDocs = (content) => {
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    body.appendParagraph("Fighting Genghis the Jengis!");
  };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
      const { content } = request;
  
      console.log(content);

      // Rotate based on app used.
      //const result = insertGoogleDocs(content);
      const result = insertCalmly(content);

      // If something went wrong, send a failed status
      if (!result) {
        sendResponse({ status: 'failed' });
      }
  
      sendResponse({ status: 'success' });
    }
  });