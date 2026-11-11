/* Runs first, in <head>. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  /* EDIT ME: holiday season (holiday palette + offer card). Months count from 0: 10 = November, 0 = January. */
  var SEASON_START = new Date(2026, 10, 1); // Nov 1, 2026
  var SEASON_END = new Date(2027, 0, 1);    // back to normal on Jan 1, 2027
  var now = new Date();
  if (now >= SEASON_START && now < SEASON_END) root.classList.add('season');
})();
