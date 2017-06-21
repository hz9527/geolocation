// type BD SG QQ GD
function getJSONP (url, callBack) {
  var script;
  var name = 'GETJSONP' + Math.random().toFixed(5).replace('.', '')
  window[name] = function (res) {
    callBack(res)
    document.querySelector('body').removeChild(script)
    delete window[name]
  }
  script = document.createElement('script')
  script.type = 'text/javascript'
  document.querySelector('body').appendChild(script)
  script.src = url + '&callback=' + name
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
      var invalidType = false
      if (config.key) {
        this.config.key = options.key
        invalidType = -1
      }
      if (options.positionType && options.positionType !== 'default') {
        if (invalidType !== -1 && options.positionType !== 'QQ') {
          invalidType = true
        }
        if (!this.typeConf.some(key => key === options.positionType)) {
          throw new Error('positionType is invalid')
        }
        this.config.positionType = options.positionType
      }
      if (placeInfo !== false && options.type) {
        if (invalidType !== -1 && options.type !== 'QQ') {
          invalidType = true
        }
        if (!this.typeConf.some(key => key === options.type)) {
          throw new Error('type is invalid')
        }
        this.config.type = options.type
      }
      if (invalidType === true) {
        throw new Error('key is necessary')
      }
      if (options.canIp === false) {
        this.config.canIp = false
      }
      if (options.timeout > 0) {
        this.config.timeout = options.timeout
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
      getJSONP('//apis.map.qq.com/ws/location/v1/ip?key=' + this.config.key + '&output=jsonp', function (res) {
        console.log(res)
      })
    }
  },
  getPostion: {
    'default': function (context, success, fail) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition( res => {
          this.posNext(context, success, this.dealPosition.default(res.coords))
        }, err => {
          if (this.config.canIp) {
            this.getPostionByIp.QQ.call(this, context, success, fail)
          } else {
            var msg = err.code === 1 ? '获取地理位置权限失败' : err.code === 2 ? '获取地理位置信息失败' : '获取地理位置超时'
            fail.call(context, msg)
          }
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
