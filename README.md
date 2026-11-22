# Recordhound Spotify sign-in

This small page lets [Recordhound](https://github.com/ShadeRF/unraid-templates/blob/main/docs/recordhound.md) connect your Spotify account in one click.

Spotify only sends people back to `https://` or `127.0.0.1` addresses after they sign in, and a home server is usually neither. So Spotify sends you here, and this page forwards you straight back to your own Recordhound.

To use it, add this address to your Spotify app's **Redirect URIs** (at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)):

```
https://shaderf.github.io/recordhound-auth/
```

## What it does with your data

Nothing. The page runs entirely in your browser:

- On the way to Spotify, it notes in your browser which Recordhound to send you back to. That note is deleted when you come back, or after an hour.
- On the way back, it passes Spotify's one-time code to your Recordhound. The code is useless without a key that only your Recordhound holds.
- There is no server, no tracking and no analytics.

If you'd rather not use this page, set **Redirect address** in Recordhound's Spotify settings to your own address instead.

This page is part of [Recordhound](https://github.com/ShadeRF/recordhound) (its source lives in `spotify-helper/` there) and shares its AGPL-3.0 license.
