/**
 * The song in the CD on the desk, when Spotify isn't set up. Open the CD case on the desk to listen.
 *
 * - `cover`: an image in /public (e.g. '/music/cover.jpg'). Leave empty for a
 *   drawn placeholder cover.
 * - `audio`: the song (or a clip of it) in /public, e.g. '/music/song.mp3'.
 *   It plays while the CD case is open and fades out when it closes; there's
 *   no player on screen.
 *
 * When Spotify is set up (README → "Spotify"), the CD shows the latest track
 * from there instead, and plays its 30-second preview from Apple when there
 * is one. Either way the song fades in quietly and fades out when the case
 * closes.
 */
export const song = {
  title: 'song title',
  artist: 'artist',
  cover: '',
  audio: '',
};
