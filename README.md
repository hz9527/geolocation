## 配置项
属性|作用|备注
---|---|---
key|地图开发者key|默认使用QQ个人key（本人申请的）
app|在一些地图中需要使用app名|申请key时的应用名
positionType|获取定位方式（值为default或map）|默认为defaul，使用h5定位
mapType|地图类型|在h5定位失败后如果设置canIp那么需要使用地图提供的ip定位，包括获取地理信息都需要用到地图厂商api，默认QQ
type|获取结果要求，值为1，2，3|1为仅获取定位，2为直接通过厂商api获取地理信息（如百度高德定位不准并初次返回速度龟速），3为先获取定位再通过定位获取地理信息，默认3
canIp|在h5或地图提供地理信息api失败后走ip定位（如果type为2再通过定位获取地理信息）|成功可能性更高，但是结果可能不准确，默认true
timeout|超时时间|通过多层后这个时间不准确默认5000

## 使用
### 设置配置项
```javascript
Position.setConfig({
  key: 'xxxx',
  app: 'xxx',
  positionType: 'default',
  mapType: 'QQ'
})
```
### 获取定位
```JavaScript
Position.getLocation(null, function (res) {
  console.log(res)
}, function (msg) {
  console.log(msg)
})
```

### 返回结果
```JavaScript
type: 1
{
  lat: xx,
  lng: xxx,
  latLng: xxx,xxxx,
  info: null,
  type: 'default'
}

{
  lat: xxx,
  lng: xxx,
  latLng: xxx,xxx,
  info: {
    address: xxx,
    nation: '',
    province: xxx,
    city: xxx,
    district: xxx
  },
  type: 'IP'
}

type 2
{
  lat: xxx,
  lng: xxx,
  latLng: xxx,xxx,
  info: {
    address: xxx,
    nation: xxx,
    province: xxx,
    city: xxx,
    district: xxx
  },
  type: 'QQ'
}

type 3
{
  positionType: 'IP', // default
  lat: xxx,
  lng: xxx,
  latLng: xxx,xxx,
  type: 'QQ',
  info: {
    address: xxx,
    nation: xxx,
    province: xxx,
    city: xxx,
    district: xxx
  }
}
```
