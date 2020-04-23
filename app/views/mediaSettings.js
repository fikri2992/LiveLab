// @todo: how to select no media
var html = require('choo/html')
const Modal = require('./components/modal.js')
var Component = require('choo/component')
const input = require('./components/input.js')
const Dropdown = require('./components/dropdown.js')
const Video = require('./components/funvideocontainer.js')
const enumerateDevices = require('enumerate-devices')

const AudioDropdown = Dropdown()
const VideoDropdown = Dropdown()

module.exports = class MediaSettings extends Component {
  constructor (opts) {
    super(opts)
    //  console.log('loading login', this.isOpen)
    this.previewVideo = null
    // this.state = state
    // this.emit = emit
    this.onSave = opts.onSave
    this.onClose = opts.onClose
    this.isOpen = true
    this.devices = { audio: [], video: [] }
    this.selectedDevices = { audio: null, video: null }
    this.tracks = { audio: null, video: null }
    this.trackInfo = { audio: {}, video: {} }
    this.constraints = {
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true
      },
      video: {
        width: 1920,
        height: 1080,
        frameRate: 30
      }
    }


    enumerateDevices().then((devices) => {
      this.devices.audio = devices.filter((elem) => elem.kind == 'audioinput')
      this.devices.video = devices.filter((elem) => elem.kind == 'videoinput')
      if(this.devices.audio.length > 0) {
        this.selectedDevices.audio = 0
        //  this.updateAudio()
      }
      if(this.devices.video.length > 0) {
        this.selectedDevices.video = 0
        //  this.updateVideo()
      }
      //    this.createElement(this.isOpen)
      //  console.log(this, this.devices.audio)
    }).catch((err) =>this.log('error', err))
  }

  //  this.createElement = this.createElement.bind(this)
  log ( type, message) {
    console[type](message)
  }

  load (element) {

  }

  update (isOpen) {
    // @ to do: test whether media settings is open has changed
    //  return true
    if(isOpen !== this.isOpen) {
      if(isOpen == true) {
        this.updateVideo()
        this.updateAudio()
      }
      return true
    }
    return false
  }

  applyAudioConstraints() {
    console.log('%c applying audio constraints ', 'background: #ff9900; color: #fff', this.constraints.audio)
    this.tracks.video.applyConstraints(this.constraints.audio)
  }

  updateAudio() {
    var constraints = Object.assign({},  this.constraints.audio, { deviceId: this.devices.audio[this.selectedDevices.audio].deviceId })
    console.log('%c getting user media (audio)', 'background: #ff00ff; color: #fff', constraints)
    navigator.mediaDevices.getUserMedia({ audio: constraints, video: false })
    .then((stream) => {
      //console.log('stream is', stream)
      console.log('%c got user media (audio)', 'background: #0099ff; color: #fff')
      this.tracks.audio = stream.getAudioTracks()[0]
      this.tracks.audio.applyConstraints(constraints) // apply constraints again because seems to not always work on initial getUserMedia
      this.trackInfo.audio = this.tracks.audio.getSettings()
    }).catch((err) => {
      this.emit('log:error', err)
    })
    //  this.createElement(this.isOpen)
  }

  applyVideoConstraints() {
    console.log('%c applying video constraints ', 'background: #ff9900; color: #fff', this.constraints.video)
    this.tracks.video.applyConstraints(this.constraints.video)
  }

  updateVideo() {
    var constraints = Object.assign({},  this.constraints.video, { deviceId: this.devices.video[this.selectedDevices.video].deviceId })
    console.log('%c getting user media (video)', 'background: #ff4499; color: #fff', constraints)
    // console.log('%c Oh my heavens! ', 'background: #222; color: #bada55',
    //         'more text');
    navigator.mediaDevices.getUserMedia({ audio: false, video: constraints })
    .then((stream) => {
      console.log('%c got user media (video)', 'background: #0044ff; color: #fff')
      this.tracks.video = stream.getVideoTracks()[0]
      this.tracks.video.applyConstraints(constraints) // apply constraints again because seems to not always work on initial getUserMedia
      this.trackInfo.video = this.tracks.video.getSettings()
      // console.log('settings', this.trackInfo.video)
      this.trackInfoEl.innerHTML = `Actual video dimensions:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps`

      this.previewVideo = Video({
        htmlProps: { class: 'w5 h4', style: 'object-fit:contain;'},
        index: "login-settings-video",
        track: this.tracks.video,
        id: this.tracks.video === null ? null : this.tracks.video.id
      })
    }).catch((err) => {
      this.emit('log:error', err)
    })
    //    this.createElement(this.isOpen)
  }

  //setVideo()

  createElement (isOpen) {
    this.isOpen = isOpen
    //  this.onClose =
    var self = this
    //  this.local.center = center
    //  this.dropDownEl =
    this.audioDropdown = AudioDropdown.render({
      value: 'Audio:  ' + (this.selectedDevices.audio === null ? '' : this.devices.audio[this.selectedDevices.audio].label),
      options: this.devices.audio.map((device, index) => (  { value: index,  label: device.label })),
      onchange:  (value) => {
        this.selectedDevices.audio = value
        this.updateAudio()
      }
    })

    this.videoDropdown = VideoDropdown.render({
      value: 'Video:  ' + (this.selectedDevices.video === null ? '' : this.devices.video[this.selectedDevices.video].label),
      options: this.devices.video.map((device, index) => (  { value: index, label: device.label})),
      onchange: (value) => {
        this.selectedDevices.video = value
        this.updateVideo()
      }
    })

    this.previewVideo = Video({
      htmlProps: { class: 'w-100 h-100', style: 'object-fit:contain;'},
      index: "login-settings-video",
      track: this.tracks.video,
      id: this.tracks.video === null ? null : this.tracks.video.id
    })

    var audioSettings = Object.keys(this.constraints.audio).map((constraint) =>
    html`<div class="pv1 dib mr3">
    <input type="checkbox" id=${constraint} name=${constraint} checked=${this.constraints.audio[constraint]}
    onchange=${(e) => {
      this.constraints.audio[constraint] = e.target.checked
      this.applyAudioConstraints()
    }}>
    <span class="pl1">${constraint}</span></div>`
  )

  var videoSettings = Object.keys(this.constraints.video).map((constraint) => html`
  <div class="dib w4 pr3">
  ${input(constraint, "",
  {
    value: this.constraints.video[constraint],
    onkeyup: (e) => {
      this.constraints.video[constraint] = parseInt(e.srcElement.value)
      this.applyVideoConstraints()
    }
  })}
  </div>`
)

this.trackInfoEl =  html` <div class="mt2 mb4 i">Actual video dimensions:  ${this.trackInfo.video.width}x${this.trackInfo.video.height}, ${this.trackInfo.video.frameRate}fps</div>`
//  console.log('rendering',this.trackInfoEl)

var popup = html`${Modal({
  show: isOpen,
  header: "Media Settings",
  contents: html`<div id="add broadcast" class="pa3 f6 fw3">
  ${this.audioDropdown}
  ${this.videoDropdown}
  <div class="w-100 db flex mt4">
  <div class="w-40 h5 dib fl">
  ${this.previewVideo}
  </div>
  <div class="w-60 dib fl pa3 pl4">
  <h3>Media Settings</h3>
  <h4> Audio </h4>
  ${audioSettings}
  <h4 class="mt4 mb0"> Video </h4>
  ${videoSettings}
  </div>
  </div>
  ${this.trackInfoEl}
  <!--buttons go here-->
  <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer fr mb4 mr6" onclick=${this.onSave}>Save</div>
  <div class="f6 link dim ph3 pv2 mb2 dib white bg-gray pointer fr mb4 mr4" onclick=${this.onClose}>Cancel</div>
  </div>`,
  close: this.onClose
})}
`
//  console.log(popup)

return popup
}
}

// ${opts.addNewStream && opts.addNewStream === true? html`
//   <div class="f6 link dim ph3 pv2 mb2 dib white bg-gray pointer" onclick=${() => (emit('devices:toggleSettings'))}>Cancel</div>
//   <div class="f6 link dim ph3 pv2 mb2 dib white bg-dark-pink pointer" onclick=${() => (emit('devices:addNewMediaToBroadcast'))}>Add Stream(s) to Broadcast</div>
//   CANCEL` : ''}

//   <!--  ${MediaSettings(state.devices, emit, { showElement: state.this.constraints.isOpen})} --->
