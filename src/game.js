'use strict'

let secret;
let attempts_max = 6;
let currentAttempt = '';
let history;
let end_game;
let force_letter;
let guessed_letters;
let parcours;
let delay = 250;

let grid = document.getElementById('grid');
window.addEventListener('keydown', function(e) { handleKeyDown(e, 'keydown'); } );
window.addEventListener('input', function(e) { handleKeyDown(e, 'input'); });

$(document).ready(function() {
  $('#putain').click(function(e){ $(this).focus(); });

  $('#grid').click(function(e) {
      $('#putain').trigger('click');
  });
});

document.getElementById('clear-button').addEventListener('click', function () {
  $('#putain').value = ''
  $('#clear-buffer').focus()
  $('#putain').focus()
})

function startGame () {

  document.getElementById('putain').focus();

  let randomIndex = Math.floor(Math.random() * DICTIONNAIRE.length);
  secret = DICTIONNAIRE[randomIndex];
  currentAttempt = secret[0];
  history = [];
  guessed_letters = [];
  end_game = false;
  force_letter = false;
  parcours = "";
  
  grid.innerHTML = '';
  buildGrid();

  updateGrid(false);

  document.getElementById('button-start').style.visibility = 'hidden';
}
startGame();


function handleKeyDown(e, type) {
  document.getElementById("clear-button").click();

  if (!end_game) {
    let letter = '';

    if (type === 'input') {
      letter = String.fromCharCode(e.target.value.charAt(e.target.selectionStart - 1).charCodeAt() - 32).toLowerCase();
    }
    if (type === 'keydown') {
      if (e.which === 8) {
        letter = 'backspace';
      } else if (e.which === 13) {
        letter = 'enter';
      }
    }

    if (letter === 'enter') {
      if (currentAttempt.length < secret.length) {
        err_msg('Mot trop court.');
        return
      }
      if (!DICTIONNAIRE.includes(currentAttempt)) {
        err_msg('Mot invalide.');
        return
      }
      if (currentAttempt === secret || history.length >= attempts_max - 1) {
        let won = currentAttempt === secret;
        setTimeout(() => show_win_pop_up(won), 1000);
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

    document.getElementById('putain').value = '';
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
  let correctLetter = secret[i];
  let attemptLetter = attempt[i];

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

function show_win_pop_up (won) {
  let img_name = won ? 'attention' : 'fou-rire';
  let txt = won ? history.length + "/" + attempts_max + " essais" : 'Alors on est nul ?';

  document.getElementById('overlay').style.display = 'block';
  document.getElementById('pop-up-parcours').innerText = parcours;
  document.getElementById('pop-up-logo').src = '../res/img/' + img_name + '.png';
  document.getElementById('pop-up-tries').innerText = txt;
  document.getElementById('pop-up-mot').innerText = secret;
}
function close_win_pop_up () {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('button-start').style.visibility = 'visible';
}

function err_msg (msg) {
  document.getElementById('err-msg').style.visibility = 'visible';
  document.getElementById('err-msg').textContent = msg;
  setTimeout(close_err_msg, 2000);
}

function close_err_msg () {
  document.getElementById('err-msg').style.visibility = 'hidden';
}

function googleit () {
  let url = 'https://www.google.com/search?q=definir+';
  window.open(url + secret.toLowerCase(), '_blank').focus();
}
