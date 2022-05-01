import speak from './speech.js'
import audio from './audio.js'
import handle from './handle.js'

document.querySelector('.start').onclick = START

function START() {
  document.querySelector('.start').onclick = () => { }
  let dataUser = JSON.parse(localStorage.getItem('dataUser'))

  document.querySelector('#callPhone').href = `tel:${dataUser?.phone}`

  fadeOut('.start')

  let inputs = document.querySelectorAll('.getdata input:not([type="radio"])')
  inputs.forEach((input, index) => {
    input.addEventListener('keyup', e => {
      if (e.key === 'Escape') {
        input.blur()
      }
      if (e.key === 'Enter') {
        inputs[index + 1]?.focus()
      }
    })
  })

  const mess = document.querySelector('.list-chat')
  audio.onresult = handleResult

  async function handleResult(e) {
    let text = e.results[0][0].transcript
    text = text[0].toUpperCase() + text.substring(1)
    mess.innerHTML = `
    <div class="chat-user">
      <span>${text}</span>
    </div>
      ${mess.innerHTML}
    `

    text = await handle(text)

    mess.innerHTML = `
    <div class="chat-ai">
      <div class="avatar-AI"></div>
      <span>${text}</span>
    </div>
      ${mess.innerHTML}`

    speak(text)
  }

  function hello() {
    document.querySelector('#name-user ').innerText = dataUser.name
    document.querySelector('.chatbox-ctn').requestFullscreen()
    let text = `Chào ${dataUser.name.substring(dataUser.name.indexOf(' ') + 1)}! Bạn cần tôi giúp gì không?`
    mess.innerHTML = `
    <div class="chat-ai">
      <div class="avatar-AI"></div>
      <span>${text}</span>
    </div>
      ${mess.innerHTML}`
    speak(text)
  }

  function getDataUser() {
    speak('Đây là lần đầu tôi gặp bạn! Xin hãy cho tôi một ít thông tin về bạn!')
    document.querySelector('.getdata-ctn').style.display = 'flex'
  }

  document.querySelector('.submit').onclick = getDataUserEvent
  function getDataUserEvent() {
    const inputs = document.querySelectorAll('.getdata input')
    let noOK
    [inputs[0].value, inputs[1].value, inputs[2].value].forEach(input => {
      if (!input) noOK = true
    })
    if (noOK) return false

    fadeOut('.getdata-ctn')
    let location
    dataUser = {
      name: inputs[0].value,
      old: inputs[1].value,
      phone: inputs[2].value
    }
    document.querySelector('#callPhone').href = `tel:${dataUser.phone}`
    if (document.querySelector('input#yes').checked)
      navigator.geolocation.getCurrentPosition(loca => {
        location = `${loca.coords.latitude},${loca.coords.longitude}`
        dataUser = {
          ...dataUser,
          location
        }
        localStorage.setItem('dataUser', JSON.stringify(dataUser))
        hello()
      })
    else {
      location = document.querySelector('#location').value
      if (location === '') {
        document.querySelector('.getdata-ctn').style.display = 'flex'
        return false
      }
      dataUser = {
        ...dataUser,
        location
      }
      localStorage.setItem('dataUser', JSON.stringify(dataUser))
      hello()
    }
  }

  document.querySelector('.mess-text ion-icon').onclick = sendMessage
  document.querySelector('.mess-text #new-mess').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') sendMessage()
  })

  async function sendMessage() {
    let input = document.querySelector('.mess-text #new-mess')
    let text = input.value
    if (text) {
      input.value = ''
      text = text[0].toUpperCase() + text.substring(1)
      mess.innerHTML = `
      <div class="chat-user">
        <span>${text}</span>
      </div>
        ${mess.innerHTML}
      `

      text = await handle(text)

      mess.innerHTML = `
      <div class="chat-ai">
        <div class="avatar-AI"></div>
        <span>${text}</span>
      </div>
        ${mess.innerHTML}`

      speak(text)
    }
  }

  if (dataUser && dataUser.name && dataUser.phone && dataUser.location) hello()
  else getDataUser()
}

function fadeOut(selector) {
  document.querySelector(selector).classList.add('fadeOut')

  setTimeout(() => {
    document.querySelector(selector).style.display = 'none'
  }, 500)
}