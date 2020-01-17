const { assert } = require('chai')
const axios = require('axios')
const round = require('lodash.round')

describe('comparing weather UI to API', () => {
  beforeEach(() => {
    //Brooklyn weather UI
    browser.url('https://darksky.net/forecast/40.7506,-73.9971/us12/en')
  })
  describe('test 1', () => {
    it('temperatue of UI matches API', () => {
      const elem = $('span.summary.swap')
      const text = elem.getText()
      const tempIdx = text.indexOf('˚')

      //this is the ui temp, converted to number
      const temp = +text.slice(0, tempIdx)
      browser.call(async () => {
        //San Francisco API call
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
        if (
          (elem === 11 && nextElem === 1) ||
          (elem === 12 && nextElem === 2)
        ) {
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

  describe('my custom tests', () => {
    beforeEach(() => {
      //San Francisco UI url
      browser.url('https://darksky.net/forecast/37.8267,-122.4233/us12/en')
    })
    it('UV index in San Francisco: UI matches API', () => {
      let elemUV = $('span.num.swip.humidity__value')
      let elemHumidity = +elemUV.getText() / 100
      browser.call(async () => {
        //San Francisco API call
        const { data } = await axios.get(
          'https://api.darksky.net/forecast/4d51fbb64d23886e24bc76aa280a1497/37.8267,-122.4233/'
        )
        const apiHumidity = data.currently.humidity
        console.log('ui and api humidity: ', elemHumidity, apiHumidity)
        assert(elemHumidity === apiHumidity)
      })
    })
    it('weather summary in San Francisco: UI matches API', () => {
      let elemSummary = $('span.summary.swap').getText()
      let idx = elemSummary.indexOf('˚')
      let elemSummaryText = elemSummary.slice(idx + 1, -1).trim()
      browser.call(async () => {
        //San Francisco API call
        const { data } = await axios.get(
          'https://api.darksky.net/forecast/4d51fbb64d23886e24bc76aa280a1497/37.8267,-122.4233'
        )
        let apiSummaryText = data.currently.summary
        console.log(
          'ui summary and api summary',
          elemSummaryText,
          apiSummaryText
        )
        assert(elemSummaryText === apiSummaryText)
      })
    })
  })
})
