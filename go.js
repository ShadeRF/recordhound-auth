// Recordhound's Spotify sign-in helper. Spotify only sends people back to https:// or 127.0.0.1 addresses,
// and a home server is usually neither, so Spotify sends you here and this page forwards you to your Recordhound.
//
// Step 1 (#go=...&back=...): Recordhound sends you here on the way to Spotify. Remember, in this browser only,
//   which Recordhound to return to, keyed by the sign-in's random "state", then go on to Spotify.
// Step 2 (?code=...&state=...): Spotify sends you back. Look up where to return by that state, and go there.
// Nothing leaves your browser except to Spotify and to your own Recordhound.
(function () {
  "use strict";
  var PREFIX = "recordhound-spotify:";
  var HOUR = 3600 * 1000;
  var msg = document.getElementById("msg");
  var say = function (text) { msg.textContent = text; };
  var here = location.origin + location.pathname;

  function store() { try { return window.localStorage; } catch (e) { return null; } }

  // forget sign-ins that were started and never finished
  var ls = store();
  if (ls) {
    for (var i = ls.length - 1; i >= 0; i--) {
      var k = ls.key(i);
      if (k && k.indexOf(PREFIX) === 0) {
        var old = null;
        try { old = JSON.parse(ls.getItem(k)); } catch (e) { old = null; }
        if (!old || !old.at || Date.now() - old.at > HOUR) ls.removeItem(k);
      }
    }
  }

  var hash = new URLSearchParams(location.hash.slice(1));
  var query = new URLSearchParams(location.search);

  if (hash.get("go")) {
    var go, back;
    try { go = new URL(hash.get("go")); back = new URL(hash.get("back")); } catch (e) {
      say("This link is broken. Start again from Settings → Spotify in your Recordhound."); return;
    }
    var state = go.searchParams.get("state");
    var ok = go.origin === "https://accounts.spotify.com" && go.pathname === "/authorize" && state
      && go.searchParams.get("redirect_uri") === here
      && (back.protocol === "http:" || back.protocol === "https:") && !back.username && !back.password;
    if (!ok) { say("This link wasn't made by Recordhound. Start again from Settings → Spotify in your Recordhound."); return; }
    var dir = back.origin + (back.pathname.slice(-1) === "/" ? back.pathname : back.pathname + "/");
    if (ls) { try { ls.setItem(PREFIX + state, JSON.stringify({ back: dir, at: Date.now() })); } catch (e) { /* falls back to pasting */ } }
    history.replaceState(null, "", location.pathname);   // keep the link out of the history
    location.replace(go.href);
    return;
  }

  if (query.get("state")) {
    var saved = null, key = PREFIX + query.get("state");
    if (ls) {
      try { saved = JSON.parse(ls.getItem(key)); } catch (e) { saved = null; }
      ls.removeItem(key);
    }
    if (saved && saved.back) {
      var to = new URL("callback", saved.back);
      ["code", "state", "error"].forEach(function (p) { if (query.get(p)) to.searchParams.set(p, query.get(p)); });
      say("Taking you back to Recordhound…");
      location.replace(to.href);
      return;
    }
    // a different browser from the one that started, or storage is blocked: hand over by copy and paste instead
    say(query.get("error") ? "Spotify sign-in was cancelled. You can close this page."
      : "Almost done. Copy this address, then in Recordhound open Settings → Spotify, choose \"Paste the address instead\" and paste it there.");
    if (!query.get("error")) {
      var addr = document.getElementById("addr");
      addr.value = location.href;
      document.getElementById("paste").hidden = false;
      document.getElementById("copy").onclick = function () {
        addr.select();
        if (navigator.clipboard) navigator.clipboard.writeText(addr.value).then(function () { say("Copied. Now paste it in Recordhound: Settings → Spotify."); });
        else document.execCommand("copy");
      };
    }
    return;
  }

  say("This page finishes connecting Spotify to Recordhound. Start from Settings → Spotify in your Recordhound.");
})();
