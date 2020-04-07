'use strict'

const html = require('choo/html')
const Login = require('./login.js')
const Video = require('./components/funvideocontainer.js')

//const workspace = require('./workspace.js')

module.exports = mainView
function mainView (state, emit) {
  if (!state.user.loggedIn) {
    return html`
    <div>
      ${state.cache(Login, 'login').render(state, emit)}
    </div>
    `
  }
  else {
    console.log(state.multiPeer.streams)
    return html`
    <div class="w-100 h-100 mw-100 dt">
       ${state.multiPeer.streams.map((stream, index) => Video({
         htmlProps: { class: 'h-50 w-100' },
         index: 'communication-' + index,
       //  track: (trackId in state.media.byId)  ? state.media.byId[trackId].track : null,
         stream: stream.stream,
         id: stream.stream.id,
         includeAudio: false
       }))}
    </div>
    `
   }
}
