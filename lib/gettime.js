function getTime(times) {
  var y = times.getFullYear()
  var m = times.getMonth() + 1
  var d = times.getDate()
  var hh = times.getHours()
  var mm = times.getMinutes()
  var ss = times.getSeconds()
  m = m < 10 ? `0${m}` : m
  d = d < 10 ? `0${d}` : d
  hh = hh < 10 ? `0${hh}` : hh
  mm = mm < 10 ? `0${mm}` : mm
  ss = ss < 10 ? `0${ss}` : ss
  return `${y}-${m}-${d}`
}

module.exports = getTime