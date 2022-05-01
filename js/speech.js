import audio from './audio.js'

function speak(text) {
  console.log(text)
  text = text?.replaceAll(',', ' ')?.replaceAll(';', ' ')?.replaceAll('\n', ' ') ?? 'Tìm không thấy!'
  responsiveVoice.speak(text, 'Vietnamese Female', {
    onstart: () => {
      if (audio.playing) audio.stop()
    },
    onend: () => {
      if (document.querySelector('.getdata-ctn').style.display === 'none')
        audio.start()
    },
    rate: 1.2
  })
}

export default speak
