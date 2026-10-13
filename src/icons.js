/* MANIFEST · icon sprite + answer shapes. Injected once so every page shares it. */
(function (MF) {
'use strict';
var P = {
  'i-check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'i-alert': '<path d="M12 8v5M12 16.5v.01"/><path d="M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  'i-live': '<circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
  'i-route': '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16"/>',
  'i-tools': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.6 17.2a1.6 1.6 0 0 0 2.3 2.3l5.7-5.7a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.2-.6-.6-2.2z"/>',
  'i-manifest': '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 12h7M9 15.5h7M9 19h4"/>',
  'i-copy': '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  'i-external': '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  'i-download': '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  'i-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'i-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'i-lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  'i-star': '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  'i-trophy': '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4l.5 3.5h-5z"/>',
  'i-users': '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5M16 5.6a3 3 0 0 1 0 5.8M18 14.8c1.6.7 2.7 2.2 3 4.7"/>',
  'i-timer': '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5V6"/>',
  'i-plus': '<path d="M12 5v14M5 12h14"/>',
  'i-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  'i-eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  'i-eye-off': '<path d="M3 3l18 18M10.6 6a9.6 9.6 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-2.8 3.4M6.3 7.3A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5a9.3 9.3 0 0 0 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  'i-play': '<path d="M7 4.5v15l12-7.5z"/>',
  'i-pause': '<path d="M8 5v14M16 5v14"/>',
  'i-next': '<path d="M6 5l9 7-9 7zM18 5v14"/>',
  'i-refresh': '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  'i-qr': '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  'i-sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  'i-moon': '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  'i-calc': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5v3M8 18h.01M12 18h.01"/>',
  'i-shield': '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  'i-file': '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
  'i-sheet': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  'i-slides': '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M7 8h6M7 11h10"/>',
  'i-mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  'i-spark': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  'i-x': '<path d="M6 6l12 12M18 6L6 18"/>',
  'i-help': '<circle cx="12" cy="12" r="9.5"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17v.01"/>',
  'i-award': '<circle cx="12" cy="9" r="6"/><path d="M8.6 13.9L7.5 21l4.5-2.6 4.5 2.6-1.1-7.1"/><path d="M9.5 9l1.7 1.7L14.7 7.3"/>',
  'i-send': '<path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4z"/>',
  'i-share': '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  'i-hand': '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16.6l-1.3-3a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
  'i-chat': '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
  'i-box': '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  'i-truck': '<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  'i-warehouse': '<path d="M3 9.5L12 4l9 5.5V20H3z"/><path d="M7 20v-7h10v7M7 16h10"/>',
  'i-agent': '<rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5M2.5 12.5v-2M21.5 12.5v-2"/>',
  'i-flag': '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  'i-search': '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  'i-grid': '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  'i-cloud': '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5z"/>',
  'i-poll': '<path d="M5 20V11M10 20V5M15 20v-7M20 20v-4"/>',
  'i-wall': '<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="10" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="16" width="8" height="4" rx="1.5"/>',
  'i-screen': '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  'i-menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
  'i-trash': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  'i-book': '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4"/>',
  'i-target': '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'
};
var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
  Object.keys(P).map(function (k) { return '<symbol id="' + k + '" viewBox="0 0 24 24">' + P[k] + '</symbol>'; }).join('') + '</svg>';
function inject() { var d = document.createElement('div'); d.innerHTML = sprite; document.body.insertBefore(d.firstChild, document.body.firstChild); }
if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);

/* Kahoot-style answer shapes: triangle, diamond, circle, square. */
MF.SHAPES = ['a', 'b', 'c', 'd'];
MF.shape = function (i, size) {
  var s = size || 22, f = 'currentColor';
  var body = [
    '<path d="M12 3.5L21.5 20h-19z" fill="' + f + '"/>',
    '<path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z" fill="' + f + '"/>',
    '<circle cx="12" cy="12" r="9.5" fill="' + f + '"/>',
    '<rect x="3" y="3" width="18" height="18" rx="1.5" fill="' + f + '"/>'
  ][i % 4];
  return '<svg class="shape" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
};
MF.shapeName = function (i) { return ['Triangle', 'Diamond', 'Circle', 'Square'][i % 4]; };

/* The horizon at Laem Chabang: Koh Larn on the far water, a ship under three
   cranes, container stacks lit on their left by a sun above-left. Colours come
   from the theme (--hz-*), so night re-lights it and the crane lamps come on. */
MF.horizon = function () {
  return '<svg class="horizon" viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><path class="hz-far" d="M118 128C160 112 205 100 252 101C300 102 334 92 372 96C408 100 432 114 462 128Z"/><path class="hz-far" d="M972 128C996 118 1022 110 1050 112C1074 114 1094 121 1114 128Z"/><rect class="hz-far" x="0" y="127" width="1200" height="2" opacity=".6"/><path class="hz-mid" d="M418 118H712L700 132H436Z"/><rect class="hz-mid" x="436" y="98" width="16" height="20"/><rect class="hz-mid" x="458" y="111" width="14" height="6.2"/><rect class="hz-mid" x="458" y="104" width="14" height="6.2"/><rect class="hz-mid" x="473.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="473.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="473.5" y="97" width="14" height="6.2"/><rect class="hz-mid" x="489.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="489.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="489.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="504.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="504.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="504.5" y="97" width="14" height="6.2"/><rect class="hz-mid" x="520.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="520.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="520.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="535.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="535.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="551.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="551.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="551.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="551.0" y="90" width="14" height="6.2"/><rect class="hz-mid" x="566.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="566.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="566.5" y="97" width="14" height="6.2"/><rect class="hz-mid" x="582.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="582.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="582.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="582.0" y="90" width="14" height="6.2"/><rect class="hz-mid" x="597.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="597.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="597.5" y="97" width="14" height="6.2"/><rect class="hz-mid" x="597.5" y="90" width="14" height="6.2"/><rect class="hz-mid" x="613.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="613.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="613.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="613.0" y="90" width="14" height="6.2"/><rect class="hz-mid" x="628.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="628.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="644.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="644.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="644.0" y="97" width="14" height="6.2"/><rect class="hz-mid" x="659.5" y="111" width="14" height="6.2"/><rect class="hz-mid" x="659.5" y="104" width="14" height="6.2"/><rect class="hz-mid" x="659.5" y="97" width="14" height="6.2"/><rect class="hz-mid" x="675.0" y="111" width="14" height="6.2"/><rect class="hz-mid" x="675.0" y="104" width="14" height="6.2"/><rect class="hz-mid" x="675.0" y="97" width="14" height="6.2"/><g class="hz-crane"><rect x="548" y="58" width="3" height="74"/><rect x="582" y="58" width="3" height="74"/><rect x="542" y="56" width="49" height="4"/><rect x="470" y="46" width="146" height="3"/><path d="M552 46L566 20L581 46" fill="none" stroke-width="2.4"/><path d="M566 20L472 46M566 20L614 46" fill="none" stroke-width="1"/><rect x="518" y="49" width="8" height="5"/></g><circle class="hz-lamp" cx="566" cy="19" r="2.4"/><g class="hz-crane"><rect x="628" y="58" width="3" height="74"/><rect x="662" y="58" width="3" height="74"/><rect x="622" y="56" width="49" height="4"/><rect x="550" y="46" width="146" height="3"/><path d="M632 46L646 20L661 46" fill="none" stroke-width="2.4"/><path d="M646 20L552 46M646 20L694 46" fill="none" stroke-width="1"/><rect x="598" y="49" width="8" height="5"/></g><circle class="hz-lamp" cx="646" cy="19" r="2.4"/><g class="hz-crane"><rect x="708" y="58" width="3" height="74"/><rect x="742" y="58" width="3" height="74"/><rect x="702" y="56" width="49" height="4"/><rect x="630" y="46" width="146" height="3"/><path d="M712 46L726 20L741 46" fill="none" stroke-width="2.4"/><path d="M726 20L632 46M726 20L774 46" fill="none" stroke-width="1"/><rect x="678" y="49" width="8" height="5"/></g><circle class="hz-lamp" cx="726" cy="19" r="2.4"/><rect class="hz-near" x="752" y="87" width="38" height="45"/><rect class="hz-lit" x="752" y="87" width="3" height="45"/><rect class="hz-seam" x="752" y="95.4" width="38" height="1.2"/><rect class="hz-seam" x="752" y="104.4" width="38" height="1.2"/><rect class="hz-seam" x="752" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="752" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="792" y="87" width="38" height="45"/><rect class="hz-lit" x="792" y="87" width="3" height="45"/><rect class="hz-seam" x="792" y="95.4" width="38" height="1.2"/><rect class="hz-seam" x="792" y="104.4" width="38" height="1.2"/><rect class="hz-seam" x="792" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="792" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="844" y="87" width="30" height="45"/><rect class="hz-lit" x="844" y="87" width="3" height="45"/><rect class="hz-seam" x="844" y="95.4" width="30" height="1.2"/><rect class="hz-seam" x="844" y="104.4" width="30" height="1.2"/><rect class="hz-seam" x="844" y="113.4" width="30" height="1.2"/><rect class="hz-seam" x="844" y="122.4" width="30" height="1.2"/><rect class="hz-box" x="844" y="78" width="30" height="9"/><rect class="hz-box-lit" x="844" y="78" width="3" height="9"/><rect class="hz-near" x="876" y="105" width="46" height="27"/><rect class="hz-lit" x="876" y="105" width="3" height="27"/><rect class="hz-seam" x="876" y="113.4" width="46" height="1.2"/><rect class="hz-seam" x="876" y="122.4" width="46" height="1.2"/><rect class="hz-near" x="924" y="96" width="38" height="36"/><rect class="hz-lit" x="924" y="96" width="3" height="36"/><rect class="hz-seam" x="924" y="104.4" width="38" height="1.2"/><rect class="hz-seam" x="924" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="924" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="976" y="105" width="46" height="27"/><rect class="hz-lit" x="976" y="105" width="3" height="27"/><rect class="hz-seam" x="976" y="113.4" width="46" height="1.2"/><rect class="hz-seam" x="976" y="122.4" width="46" height="1.2"/><rect class="hz-near" x="1024" y="87" width="38" height="45"/><rect class="hz-lit" x="1024" y="87" width="3" height="45"/><rect class="hz-seam" x="1024" y="95.4" width="38" height="1.2"/><rect class="hz-seam" x="1024" y="104.4" width="38" height="1.2"/><rect class="hz-seam" x="1024" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="1024" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="1076" y="114" width="30" height="18"/><rect class="hz-lit" x="1076" y="114" width="3" height="18"/><rect class="hz-seam" x="1076" y="122.4" width="30" height="1.2"/><rect class="hz-near" x="1108" y="105" width="30" height="27"/><rect class="hz-lit" x="1108" y="105" width="3" height="27"/><rect class="hz-seam" x="1108" y="113.4" width="30" height="1.2"/><rect class="hz-seam" x="1108" y="122.4" width="30" height="1.2"/><rect class="hz-near" x="1140" y="96" width="38" height="36"/><rect class="hz-lit" x="1140" y="96" width="3" height="36"/><rect class="hz-seam" x="1140" y="104.4" width="38" height="1.2"/><rect class="hz-seam" x="1140" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="1140" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="1192" y="96" width="46" height="36"/><rect class="hz-lit" x="1192" y="96" width="3" height="36"/><rect class="hz-seam" x="1192" y="104.4" width="46" height="1.2"/><rect class="hz-seam" x="1192" y="113.4" width="46" height="1.2"/><rect class="hz-seam" x="1192" y="122.4" width="46" height="1.2"/><rect class="hz-near" x="0" y="87" width="46" height="45"/><rect class="hz-lit" x="0" y="87" width="3" height="45"/><rect class="hz-seam" x="0" y="95.4" width="46" height="1.2"/><rect class="hz-seam" x="0" y="104.4" width="46" height="1.2"/><rect class="hz-seam" x="0" y="113.4" width="46" height="1.2"/><rect class="hz-seam" x="0" y="122.4" width="46" height="1.2"/><rect class="hz-near" x="52" y="105" width="38" height="27"/><rect class="hz-lit" x="52" y="105" width="3" height="27"/><rect class="hz-seam" x="52" y="113.4" width="38" height="1.2"/><rect class="hz-seam" x="52" y="122.4" width="38" height="1.2"/><rect class="hz-near" x="92" y="105" width="30" height="27"/><rect class="hz-lit" x="92" y="105" width="3" height="27"/><rect class="hz-seam" x="92" y="113.4" width="30" height="1.2"/><rect class="hz-seam" x="92" y="122.4" width="30" height="1.2"/><rect class="hz-near" x="136" y="105" width="30" height="27"/><rect class="hz-lit" x="136" y="105" width="3" height="27"/><rect class="hz-seam" x="136" y="113.4" width="30" height="1.2"/><rect class="hz-seam" x="136" y="122.4" width="30" height="1.2"/><rect class="hz-near" x="168" y="105" width="46" height="27"/><rect class="hz-lit" x="168" y="105" width="3" height="27"/><rect class="hz-seam" x="168" y="113.4" width="46" height="1.2"/><rect class="hz-seam" x="168" y="122.4" width="46" height="1.2"/><rect class="hz-near" x="0" y="131" width="1200" height="9"/></svg>';
};
})(window.MF = window.MF || {});
