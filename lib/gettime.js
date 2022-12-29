function getTime(times) {
  let y = times.getFullYear();
  let m = times.getMonth() + 1;
  let d = times.getDate();
  let hh = times.getHours();
  let mm = times.getMinutes();
  let ss = times.getSeconds();
  m = m < 10 ? `0${m}` : m
  d = d < 10 ? `0${d}` : d
  hh = hh < 10 ? `0${hh}` : hh
  mm = mm < 10 ? `0${mm}` : mm
  ss = ss < 10 ? `0${ss}` : ss
  return `${y}-${m}-${d}`
}

module.exports = getTime