'use strict'

let randomIndex = Math.floor(Math.random() * DICTIONNAIRE.length);
let secret = DICTIONNAIRE[randomIndex];
secret = "VOITURE";

let attempts_max = 6;
let currentAttempt = secret[0];
let history = []
let end_game = false;
let force_letter = false;
let guessed_letters = [];
let not_really_guessed_letters = [];
let parcours = "";

let grid = document.getElementById('grid');
buildGrid();
updateGrid(false);
window.addEventListener('keydown', handleKeyDown);

function handleKeyDown(e) {
  if (!end_game) {
    let letter = e.key.toLowerCase()
    if (letter === 'enter') {
      if (currentAttempt.length < secret.length) {
        err_msg('Mot trop court.');
        return
      }
      if (!DICTIONNAIRE.includes(currentAttempt)) {
        err_msg('Mot invalide.');
        return
      }
      if (currentAttempt === secret) {
          setTimeout(show_win_pop_up, 1000);
          end_game = true;
      } else if (history.length >= attempts_max - 1) {
          document.getElementById('status').innerText = secret;
          end_game = true;
      }
      history.push(currentAttempt);
      currentAttempt = secret[0];
    } else if (letter === 'backspace') {
      if (currentAttempt.length != 1) currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1);
    } else if (/[a-z]/.test(letter) && letter.length === 1) {
      if (letter.toUpperCase() === secret[0] && currentAttempt.length === 1 && !force_letter) {
        currentAttempt = letter.toUpperCase();
        force_letter = true;
      } else if (currentAttempt.length < secret.length) {
        currentAttempt += letter.toUpperCase();
        force_letter = false;
      }
    }

    updateGrid(end_game);
  }
}

function buildGrid () {
  let grid = document.getElementById('grid');
  let table = document.createElement('table');

  for (let i = 0; i < attempts_max; i++) {
    let row = document.createElement('tr');
    for (let j = 0; j < secret.length; j++) {
      let cell = document.createElement('td');
      cell.textContent = '';
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  grid.appendChild(table);
}

function updateGrid(end_game) {
  let table = document.getElementsByTagName('table');
  let row = table[0].rows[0];

  parcours = '';

  for (let attempt of history) {
    drawAttempt(row, attempt, false);
    row = row.nextSibling;
  }

  if (!end_game) {
    drawAttempt(row, currentAttempt, true);
  }
}

function drawAttempt(row, attempt, isCurrent) {

  for (let i = 0; i < secret.length; i++) {

    let cell = row.children[i];
    cell.textContent = '.';
    
    if (i === 0 && attempt[i] === undefined) {
        cell.textContent = secret[0];
    }

    if (history.length) {
      for (let attempt_history of history) {
        if (attempt_history[i] === secret[i] && attempt.length === 1 && isCurrent) {
          cell.textContent = secret[i];
          break;
        }
      }
    }

    if (attempt[i] !== undefined) {
      cell.textContent = attempt[i];
    }

    if (isCurrent) {
        cell.style.backgroundColor = '#0077c7';
    } else {
      getBgColor(attempt, i, cell);
    }
  }

  if (parcours) parcours += '\n';

  guessed_letters = [];
}

function getBgColor(attempt, i, cell) {
  let correctLetter = secret[i]
  let attemptLetter = attempt[i]
  if (
    attemptLetter === undefined ||
    secret.indexOf(attemptLetter) === -1
  ) {
    cell.classList.add('no-place');
    parcours += '🟦';
  }
  else if (correctLetter === attemptLetter) {
    cell.classList.add('good-place');
    parcours += '🟥';
    if (guessed_letters.indexOf(attemptLetter) === -1) {
      guessed_letters.push(attemptLetter);
    }
  } else {
    if (guessed_letters.indexOf(attemptLetter) === -1) {
      cell.classList.add('wrong-place');
      guessed_letters.push(attemptLetter);
      parcours += '🟡';
    } else {
      parcours += '🟦';
    }
  }
}

function show_win_pop_up () {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('pop-up-parcours').innerText = parcours;
  document.getElementById('pop-up-tries').innerText = history.length + "/" + attempts_max + " essais";
}
function close_win_pop_up () {
  document.getElementById('overlay').style.display = 'none';
}

function err_msg (msg) {
  document.getElementById('err-msg').style.visibility = 'visible';
  document.getElementById('err-msg').textContent = msg;
  setTimeout(close_err_msg, 2000);
}

function close_err_msg () {
  document.getElementById('err-msg').style.visibility = 'hidden';
}