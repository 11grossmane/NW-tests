const { assert } = require('chai')
const axios = require('axios')
const round = require('lodash.round')
let x = 1
describe('test 1', () => {
  it('temperatue of UI matches API', () => {
    //is this supposed to be a different lat,long than the API?
    browser.url('https://darksky.net/forecast/40.7506,-73.9971/us12/en')
    const elem = $('span.summary.swap')
    const text = elem.getText()
    const tempIdx = text.indexOf('˚')

    //this is the ui temp, converted to number
    const temp = +text.slice(0, tempIdx)
    browser.call(async () => {
      const { data } = await axios.get(
        'https://api.darksky.net/forecast/4d51fbb64d23886e24bc76aa280a1497/37.8267,-122.4233/'
      )

      //this is rounded API temp
      const tempAPI = round(data.currently.temperature)
      console.log('temps are', temp, tempAPI)
      assert(temp === tempAPI)
    })
  })
})

describe('test 2', () => {
  it('temperature displays in 2 hour increments', () => {
    browser.url('https://darksky.net/forecast/40.7506,-73.9971/us12/en')
    const elems = $$('span.hour > span')
    const formattedElems = elems.map((cur, i) => {
      let text = cur.getText()
      return +text.slice(0, text.length - 2)
    })
    console.log('formatted elems', formattedElems) //[ 'N', '5', '7', '9', '11', '1', '3', '5', '7', '9', '11', '1' ]

    let difIsTwo = true

    //we start at 1 to skip 'N'
    for (let i = 1; i < formattedElems.length - 1; i++) {
      let elem = +formattedElems[i]
      let nextElem = +formattedElems[i + 1]

      //these are the two cases where we transition past noon/midnight
      if ((elem === 11 && nextElem === 1) || (elem === 12 && nextElem === 2)) {
        //do nothing, continue loop
        continue
      } else {
        if (nextElem - elem !== 2) {
          difIsTwo = false
          //if the difference ever isn't two break
          break
        }
      }
    }
    assert(difIsTwo)
  })
})
