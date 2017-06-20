// type BD SG QQ GD
function getJSONP (url, callBack) {
  var script;
  var name = 'GETJSONP' + Math.random().toFixed(5).replace('.', '')
  window[name] = function (res) {
    callBack(res)
    document.querySelector('body').removeChild(script)
  }
  script = document.createElement('script')
  script.type = 'text/javascript'
  document.querySelector('body').appendChild(script)
  script.src = url + '&output=jsonp&callback=' + name
}

var Position = {
  config: {
    key: 'EP2BZ-N2U2U-UMPV6-2Z5NP-OV2JH-E6FI2',
    positionType: 'default',
    type: 'QQ',
    canIp: true,
    timeout: 5000
  },
  typeConf: ['BD', 'SG', 'QQ', 'GD'],
  setConfig: function (options, placeInfo) {
    if (options && options.constructor === Object) {
      if (config.key) {
        this.config.key = options.key
      }
      if (options.positionType && options.positionType !== 'default') {
        if (!options.key) {
          throw new Error('key is necessary')
        }
        if (!this.typeConf.some(key => key === options.positionType)) {
          throw new Error('positionType is invalid')
        }
        this.config.positionType = options.positionType
      }
      if (placeInfo !== false && options.type) {
        if (!options.key) {
          throw new Error('key is necessary')
        }
        if (!this.typeConf.some(key => key === options.type)) {
          throw new Error('type is invalid')
        }
        this.config.type = options.type
      }
    }
    if (placeInfo === false) {
      this.config.type = null
    }
    if (this.config.positionType === 'default' && location.protocol !== 'https:') {
      console.warn('http can`t use geolocation')
    }
  },
  dealPosition: {
    default: function (pos) {
      return {
        lat: pos.latitude,
        lng: pos.longitude,
        lngLat: pos.longitude + ',' + pos.latitude,
        type: 'default'
      }
    }
  },
  posNext: function (context, success, pos) {
    console.log(pos)
  },
  getPostionByIp: {
    'QQ': function (context, success, fail) {
      getJSONP('//apis.map.qq.com/ws/location/v1/ip?key=' + this.config.key, function (res) {
        console.log(res)
      })
    }
  },
  getPostion: {
    'default': function (context, success, fail) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition( res => {
          this.posNext(context, success, this.dealPosition.default(res.coords))
        }, res => {
          this.getPostionByIp.QQ.call(this, context, success, fail)
        }, {
          enableHighAccuracy: true,
          timeout: this.config.timeout,
          maximumAge: 0
        })
      }
    }
  },
  getPlaceInfo: {

  },
  getLocation: function (context, success, fail) {
    context = context || null
    success = success || function () {}
    fail = fail || function () {}
    this.getPostion[this.config.positionType].call(this, context, success, fail)
  }
}
