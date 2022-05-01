// 1. Chào
// 2. Gọi điện -> mobile
// 3. Times -> ok
// 4. Thời tiết -> ok
// 5. gg map -> OK
// 6. tìm kiếm với gg -> ok
// 7. tìm kiếm định nghĩa với wiki

import speak from "./speech.js"

function handleResult(text) {
  text = text.toLowerCase()
  if (text.includes('sửa thông tin'))
    return handleEvent('setting')
  if (text.includes('gọi'))
    return handleEvent('call')
  if (text.includes('cứu') || text.includes('giúp với') || text.includes('lạc'))
    return handleEvent('help')
  if (text.includes('giờ') && !text.includes('làm'))
    return handleEvent('getTimes')
  if (text.includes('thời tiết'))
    return handleEvent('weather', text.substring(text.lastIndexOf('thời tiết') + 'thời tiết'.length).replace('tại', ' ').trim())
  if (text.includes('tìm'))
    return handleEvent('search', text.substring(text.indexOf('tìm') + 'tìm'.length).replace('kiếm', '').trim())
  if (text.includes('mở'))
    return handleEvent('search', text.substring(text.indexOf('mở') + 'mở'.length).trim())
  if (text.includes('là gì'))
    return handleEvent('wiki', text.substring(0, text.indexOf('là gì')).trim())
  if (text.includes('đường') && text.includes('đến'))
    return handleEvent('map', text.substring(text.indexOf('đến') + 'đến'.length).trim())

  if (text.includes('chào') || text.includes('hello') || (text.includes('hi') && text[text.indexOf('hi') + 2] === ' ') || text.includes('bạn là ai'))
    return handleEvent('hello')
  if (text.includes('tạm biệt') || text.includes('bye') || text.includes('không'))
    return handleEvent('end')
  if (text.includes('hay'))
    return 'Bạn quá khen!'
  return 'Mình không hiểu!'
}

function handleEvent(event, ...data) {
  switch (event) {
    case 'end':
      return handleEnd()
    case 'hello':
      return handleHello()
    case 'call':
      return handleCall()
    case 'help':
      return handleHelp()
    case 'getTimes':
      return handleGetTimes()
    case 'weather':
      return handleWeather(data)
    case 'search':
      return handleSearch(data)
    case 'wiki':
      return handleWiki(data)
    case 'map':
      return handleMap(data)
    case 'setting':
      return handleSetting()
    default:
      console.error('No Event')
  }
}

function handleEnd() {
  setTimeout(function () {
    location.reload()
  }, 3000)
  return 'Tạm biệt bạn!'
}

function handleHello() {
  let name = JSON.parse(localStorage.getItem('dataUser')).name
  return `Chào ${name.substring(name.indexOf(' ') + 1)}! Mình là trợ lý của bạn! Mình làm được khá nhiều việc! Bạn cần mình giúp gì nè?`
}

function handleCall() {
  let data = JSON.parse(localStorage.getItem('dataUser'))
  let call = document.querySelector('#callPhone')
  call.href = `tel:${data.phone}`
  call.click()
  handleSendLocation()
  return 'OK! Tôi gọi ngay đây!'
}

function handleSendLocation() {
  let data = JSON.parse(localStorage.getItem('dataUser'))
  navigator.geolocation.getCurrentPosition(loca => {
    let message = `https://www.google.com/maps/dir//${loca.coords.latitude},${loca.coords.longitude}`
    console.log(message)
    let sms = document.querySelector('#smsPhone')
    sms.href = `sms:[${data.phone}]?body=[${message}]`
    sms.style.display = 'block'
    sms.addEventListener('click', () => {
      sms.style.display = 'none'
    })
  })
}

function handleHelp() {
  let dataUser = JSON.parse(localStorage.getItem('dataUser'))
  navigator.geolocation.getCurrentPosition(location =>
    window.open(`https://www.google.com/maps/dir/${location.coords.latitude},${location.coords.longitude}/${dataUser.location.replaceAll(' ', '+')}/@${location.coords.latitude},${location.coords.longitude},13z/am=t`)
  )
  setTimeout(function () {
    speak('Gọi cho người thân nếu bạn cần!')
    setTimeout(() => { document.querySelector('#callPhone').click() }, 3000)
    handleSendLocation()
  }, 4000)
  return 'Đây là đường đến nhà bạn!!!'
}

function handleGetTimes() {
  let times = new Date()
  return `${times.getHours()} giờ ${times.getMinutes()} phút ${times.getSeconds()} giây!`
}

async function handleWeather([data]) {
  data = data.replaceAll('thế', '').replaceAll('nào', '').replaceAll('ra', '').replaceAll('sao', '')
  const APP_ID = 'cf26e7b2c25b5acd18ed5c3e836fb235'
  let text
  if (data.includes('đây')) {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(async (loca) => {
        await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loca.coords.latitude}&lon=${loca.coords.longitude}&appid=${APP_ID}&units=metric&lang=vi`)
          .then(response => response.json())
          .then(weather => {
            resolve(`${weather.name}, ${Math.round(weather.main.temp)} độ C, ${weather.weather[0].description}`)
          })
      })
    })
      .then(response => text = response)
    return text
  } else {
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${data}&appid=${APP_ID}&units=metric&lang=vi`)
      .then(response => response.json())
      .then(weather => {
        text = `${weather.name.toUpperCase()}, ${Math.round(weather.main.temp)} độ C, ${weather.weather[0].description[0].toUpperCase() + weather.weather[0].description.substring(1)}`
      })
      .catch(() => text = 'Sorry! Mình tìm không thấy!')
    return text
  }
}

function handleSearch([data]) {
  window.open(`https://www.google.com/search?q=${data.replaceAll(' ', '+')}`)
  return 'Có kết quả rồi nè!'
}

function handleWiki([data]) {
  return getDescription(getPage(data))

  async function getPage(data) {
    let pages
    await fetch(`https://vi.wikipedia.org/w/api.php?origin=*&action=opensearch&utf-8&search=${data}`)
      .then(response => response.json())
      .then(search => search[1])
      .then(name => { pages = name })
    return pages
  }
  async function getDescription(pages) {
    let name = await pages
    let description
    await fetch(`https://vi.wikipedia.org/w/api.php?action=query&format=json&titles=${name[0]}&prop=extracts&exintro&explaintext&origin=*`)
      .then(response => response.json())
      .then(data => data.query.pages[Object.keys(data.query.pages)[0]].extract)
      .then(des => description = des)
    return description || 'Sorry! Mình tìm không thấy!'
  }
}

function handleMap([data]) {
  navigator.geolocation.getCurrentPosition(location =>
    window.open(`https://www.google.com/maps/dir/${location.coords.latitude},${location.coords.longitude}/${data.replaceAll(' ', '+')}/@${location.coords.latitude},${location.coords.longitude},13z/am=t`)
  )
  return 'Đường đi nè!'
}

function handleSetting() {
  let inputs = document.querySelectorAll('.getdata input')
  const data = JSON.parse(localStorage.getItem('dataUser'))
  inputs[0].value = data.name
  inputs[1].value = data.old
  inputs[2].value = data.phone
  inputs[5].value = data.location ? data.location : ''
  if (inputs[5].value) inputs[4].checked = true
  document.querySelector('.getdata-ctn').style.display = 'flex'
  return 'Ok!'
}

export default handleResult
