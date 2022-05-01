var SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition

const userAudio = new SpeechRecognition()
userAudio.lang = 'vi-VI'
// userAudio.continuous = true

document.querySelector('#mic-icon').onclick = () => {
  userAudio.start()
}

userAudio.onaudiostart = (e) => {
  responsiveVoice.cancel()
  document.querySelector('.mess-mic').classList.add('active')
}

userAudio.onaudioend = (e) => {
  document.querySelector('.mess-mic').classList.remove('active')
}

export default userAudio
