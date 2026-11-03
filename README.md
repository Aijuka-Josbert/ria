# Ria's Birthday Chaos Reset 🎂✦

Plain HTML/CSS/JS. No install, no build. Open `index.html` or host it on GitHub Pages.

## What's new
- 7 missions (added Balloon Pop and Memory Match), synthesized sound effects, mute button
- Birthday surprise: locked gift -> tap 3 times -> cake -> blow out candles (tap, or real mic blow)
  -> fireworks + confetti + "Happy Birthday" tune -> typed letter -> redeemable vouchers -> certificate
- Fixed a broken stylesheet (stray `+` characters were breaking the animations)

## Make it personal (script.js, top of file, `CONFIG`)
Letter text, vouchers, number of candles, random links. Change the vouchers to things you will really do.

## Shortcuts for testing
- `index.html?surprise` jumps straight to the gift
- tap the RIA.EXE logo 5 times does the same

## Notes
- Sound starts only after a tap (browser rule). Mic blowing needs https or localhost and her permission; it falls back to tapping.
- Random links are external sites; check they still load before sending.
