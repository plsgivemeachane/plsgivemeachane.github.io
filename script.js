var test2;
var readyToSend = true
const sleep = ms => new Promise(r => setTimeout(r, ms));
document.getElementById("chat")
  .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13 && !document.getElementById("send").disabled) {
      document.getElementById("send").click();
    }
  });

function changeColor() {
  const button = document.getElementById("send")
  button.disabled = true;
  button.style.backgroundColor = 'limegreen';
  setTimeout(function() {
    console.log("HEllo")
    button.style.backgroundColor = '#52575D';
  }, 500);
  input = document.getElementById("chat").value
  if (input != "") {
    handle(input)
    readyToSend = false
  }
  document.getElementById("chat").value = ""
}
async function handle(content) {
  //Css things :))
  if(!readyToSend) return;
  const ul = document.getElementById("chats")
  const li = document.createElement("li")
  li.innerText = content
  li.classList.add("user")
  ul.appendChild(li)
  document.getElementById("messages").scrollTo(0, document.getElementById("messages").scrollHeight);
  //End Css things
  const myRoles = { "role": "user", "content": content }
  const lis = document.getElementsByTagName('li');
  var questionData = []
  for (let li of lis) {
    if (li.className == "user") {
      questionData.push({
        "role": "user",
        "content": li.innerText
      })
    } else if (li.className == "ai") {
      questionData.push({
        "role": "assistant",
        "content": li.innerText
      })
    }
  }
  questionData.push(myRoles)
  // Loading animation
  const div = document.createElement("div")
  div.classList.add("lds-dual-ring")
  ul.append(div)
  setTimeout(() => {
    try {
      ul.removeChild(div)
      ul.removeChild(li)
      alert("Something wents wrong please tries again");
    }
    catch (e) { }
  }, 60000)
  // Getting request
  const url = "https://free.churchless.tech/v1/chat/completions"
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': "text/event-stream",
      "Content-Type": "application/json",
      "Authorization": "Bearer ChatGPT-Hackers"
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": questionData,
      "stream": true
    })
  }, timeout = 60000);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try { ul.removeChild(div) }
  catch (e) { }
  const repli = document.createElement("li")
  repli.innerText = "";
  repli.classList.add("ai");
  ul.appendChild(repli);
  var converter = new showdown.Converter()
  var TEXT = ""
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    test2 = value
    //console.log('Received', value);
    if (value == "[DONE]") break;
    //Value produce
    parts = value.split("\n\n")
    for (var part of parts) {
      var json = part.substring(6)
      try {
        if (json != "") {
          var data = JSON.parse(json)
          var content = data.choices[0].delta.content
          if (content == null)
            continue;
          //console.log(content);
          TEXT += content
          //console.log(TEXT)
          repli.innerHTML = converter.makeHtml(TEXT)
          document.getElementById("messages").scrollTo(0, document.getElementById("messages").scrollHeight);
        }
      } catch (e) {
        //Who care
      }
    }
  }

  console.log('Response fully received');
  readyToSend = true
  document.getElementById("send").disabled = false;
}

function chooseFile() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '*'; // Specify the accepted file types if needed

  input.onchange = function(event) {
    var selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);
    // You can perform further actions with the selected file here
    if (!selectedFile) return;
    document.getElementsByClassName("overlay")[0].style.display = "block";
    const bar = document.getElementsByClassName("progress")[0]
    const reader = new FileReader();
    reader.onload = async function(e) {
      const fileContent = e.target.result;
      const chunkSize = 4000
      const result = chunkString(fileContent, chunkSize);
      const divide = result.length
      for (var i = 0; i < divide; i++) {
        bar.style.width = ((i + 1) / divide) * 100 + "%"
        content = "Summary in short.Part " + (i + 1) + "/" + divide + " of " + selectedFile.name + "\n" + result[i]
        console.log(content)
        while (!readyToSend){
          await sleep(2000)
        }
        handle(content)
        readyToSend = false
      }
      while (!readyToSend){
        await sleep(2000)
      }
      bar.style.width = "100%"
      document.getElementsByClassName("overlay")[0].style.display = "none";
    };
    reader.readAsText(selectedFile);
  };

  input.click();
}

function chunkString(string, chunkSize) {
  const chunks = [];
  for (let i = 0; i < string.length; i += chunkSize) {
    chunks.push(string.slice(i, i + chunkSize));
  }
  return chunks;
}


if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/service-worker.js")
}
