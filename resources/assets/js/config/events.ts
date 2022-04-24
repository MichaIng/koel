export type EventName =
  'KOEL_READY'
  | 'SONG_STARTED'
  | 'LOAD_MAIN_CONTENT'
  | 'LOG_OUT'
  | 'TOGGLE_SIDEBAR'
  | 'TOGGLE_SEARCH_FORM'
  | 'SHOW_OVERLAY'
  | 'HIDE_OVERLAY'
  | 'FOCUS_SEARCH_FIELD'
  | 'PLAY_YOUTUBE_VIDEO'
  | 'INIT_EQUALIZER'
  | 'TOGGLE_VISUALIZER'
  | 'SET_SELECTED_SONGS'
  | 'SEARCH_KEYWORDS_CHANGED'
  | 'SONG_CONTEXT_MENU_REQUESTED'
  | 'ALBUM_CONTEXT_MENU_REQUESTED'
  | 'ARTIST_CONTEXT_MENU_REQUESTED'
  | 'MODAL_SHOW_CREATE_SMART_PLAYLIST_FORM'
  | 'MODAL_SHOW_EDIT_SMART_PLAYLIST_FORM'
  | 'MODAL_SHOW_ADD_USER_FORM'
  | 'MODAL_SHOW_EDIT_USER_FORM'
  | 'MODAL_SHOW_EDIT_SONG_FORM'
  | 'MODAL_SHOW_ABOUT_KOEL'
  | 'PLAYLIST_DELETE'
  | 'SMART_PLAYLIST_UPDATED'

  // upload-related
  | 'SONG_UPLOADED'
  | 'UPLOAD_QUEUE_FINISHED'

  // socket events
  | 'SOCKET_TOGGLE_PLAYBACK'
  | 'SOCKET_TOGGLE_FAVORITE'
  | 'SOCKET_PLAY_NEXT'
  | 'SOCKET_PLAY_PREV'
  | 'SOCKET_PLAYBACK_STOPPED'
  | 'SOCKET_GET_STATUS'
  | 'SOCKET_STATUS'
  | 'SOCKET_GET_CURRENT_SONG'
  | 'SOCKET_SONG'
  | 'SOCKET_SET_VOLUME'
  | 'SOCKET_VOLUME_CHANGED'