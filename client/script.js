const SERVER_URL = 'https://afternoon-stream-48697.herokuapp.com';
const GAME_URL = 'https://afternoon-stream-48697.herokuapp.com/client/';
const socket = io(SERVER_URL);
let player_count = 0;

let hash = location.hash.substr(1);
location.hash = '';

document.addEventListener('DOMContentLoaded', function (event) {
  const buttons = document.querySelectorAll('.four-in-line a');
  for (let button of buttons) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      let id = Number(this.getAttribute('data-id'));
      socket.emit('make_move', id);
    });
  }

  if (hash.length == 5) {
    joinGame(hash);
  }

  window.onhashchange = function () {
    hash = location.hash.substr(1);
    if (hash.length == 5) {
      joinGame(hash);
    }
    location.hash = '#';
  };

  document.getElementById('new_game').addEventListener('click', function () {
    player_count = 1;
    socket.emit('newGame', initialize);
    document.getElementById('copy-btn').style.display = 'inline';
    document.querySelector('.instructions').style.display = 'none';
  });

  document
    .getElementById('join_game')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      const input = this.querySelector('[name=game_code]');
      room_name = input.value;
      joinGame(room_name);
    });

  document
    .getElementById('resign-btn')
    .addEventListener('click', function (event) {
      event.preventDefault();
      socket.emit('resign');
    });
  document
    .getElementById('start-btn')
    .addEventListener('click', function (event) {
      event.preventDefault();
      socket.emit('start');
    });

  socket.on('setActivePlayer', setActivePlayer);

  socket.on('put_symbol', function (obj) {
    const object = JSON.parse(obj);
    if (object.hasOwnProperty('game_won')) {
      message('Winner is ' + object.game_won + '!');
      document.getElementById('start-btn').style.display = 'block';
      document.getElementById('resign-btn').style.display = 'none';
      document.body.classList.toggle('game_ended');
    }
    buttons[object.id].textContent = object.symbol;
  });

  socket.on('new_session', function (json) {
    message('');
    document.body.classList.toggle('game_ended');
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('resign-btn').style.display = 'block';
    for (let button of buttons) {
      button.textContent = '';
    }
  });

  socket.on('player_resigned', function (id) {
    id = JSON.parse(id);
    if (id == socket.id) {
      message('You have resigned.');
    } else {
      // let symbol = player_count == 1 ? 'x' : 'o';
      message('Opponent resigned!');
    }

    for (let button of buttons) {
      button.textContent = '';
    }

    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('resign-btn').style.display = 'none';

    document.body.classList.remove('active_player');
    document.body.classList.toggle('game_ended');
  });

  function joinGame(room_name) {
    player_count = 2;
    socket.emit('joinGame', room_name, initialize);
    document.querySelector('.instructions').style.display = 'none';
  }

  function setActivePlayer(first_turn) {
    if (first_turn == player_count) {
      document.body.classList.add('active_player');
    } else {
      document.body.classList.remove('active_player');
    }
  }

  function initialize(code, player_nr, moves = {}) {
    for (const [id, symbol] of Object.entries(moves)) {
      buttons[id].textContent = symbol;
    }

    document.querySelector('.game_code').value = GAME_URL + '#' + code;
    document.querySelector('.game_code_text').textContent = 'Room: ' + code;
    // document.querySelector('.player_symbol').textContent =
    //   player_nr == 1 ? ' [x]' : ' [o]';
    document.querySelector('.player').textContent =
      'Player: ' + (player_nr == 1 ? 'X' : 'O');

    document.querySelector('.game_block').style.display = 'initial';
    document.querySelector('.start_game').style.display = 'none';
  }

  function message(text) {
    document.querySelector('.message').textContent = text;
  }
});
