import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

/*
  Generates triple dots when the AI is formulating it's answer
*/

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'

    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

/*
  Generates each letter of the AI's answer
*/

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

/*
  Generates an unique ID for each message of the robot
*/

function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

/*
  Creates the stripe for each chat message,
  depending if it's a bot's message or a user's message
*/

function chatStripe(isAi, value, uniqueId) {
  return(
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat>
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

/*
  Takes the user's input and adds it to the chat stripe,
  as well as it fetches data from the server to get the bot's response 
*/

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)
  
  // user's chatstripe

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  // bot's chatstripe

  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
  
  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  //fetch data from the server

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if (response.ok) {

    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)

  } else {

    const err = await response.text()

    messageDiv.innerHTML = "Something went wrong :("

    alert(err)

  }
}

/* 
  It calls the handleSubmit function if either the
  enter key or the submit button is pressed
*/

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.key === "Enter") {
    handleSubmit(e)
  }
})
