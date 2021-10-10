const io = require('socket.io')();

const rooms = {};

const game_data = {};
/*
let moves = {};
let player_to_move = 1;
let game_status = true;
*/

io.on('connection', (socket) => {
  const action = new Actions(socket);
  socket.on('newGame', function (callback) {
    let room_name = makeid(5);
    rooms[socket.id] = room_name;

    socket.join(room_name);
    socket.number = 1;

    callback(room_name, socket.number);
  });

  socket.on('joinGame', function (room_name, callback) {
    const room = io.sockets.adapter.rooms[room_name];

    let users;
    console.log(room, room_name);
    if (room) {
      users = room.sockets;
    } else {
      console.log('Unknown room name');
      return;
    }
    let user_count = Object.entries(users).length;
    if (user_count == 0) {
      console.log('No players yet');
      return;
    } else if (user_count > 1) {
      console.log('Too many players');
      return;
    }

    game_data[room_name] = {
      moves: {},
      player_to_move: Math.floor(Math.random()) + 1,
      game_status: true,
    };

    socket.join(room_name);
    socket.number = user_count + 1;
    rooms[socket.id] = room_name;

    action.emitAll('setActivePlayer', game_data[room_name].player_to_move);

    callback(room_name, socket.number, game_data[room_name].moves);
  });

  socket.on('resign', function () {
    let room_name = rooms[socket.id];
    game_data[room_name].moves = {};
    action.emitAll('player_resigned', socket.id);
  });

  socket.on('start', function () {
    let room_name = rooms[socket.id];
    game_data[room_name].player_to_move = Math.floor(Math.random()) + 1;
    game_data[room_name].moves = {};
    game_data[room_name].game_status = true;
    action.emitAll('new_session', null);
    action.emitAll('setActivePlayer', game_data[room_name].player_to_move); //
  });

  socket.on('make_move', function (id) {
    let room_name = rooms[socket.id];
    let room = game_data[room_name];
    if (!room) {
      console.log('unknown room');
      return;
    }

    let moves = room.moves;
    console.log(room);

    id = Number(id);
    if (room.game_status === false) {
      return;
    }
    if (socket.number === room.player_to_move) {
      if (
        !moves.hasOwnProperty(id) &&
        (id > 89 || moves.hasOwnProperty(id + 10))
      ) {
        let symbol = room.player_to_move === 1 ? 'x' : 'o';
        room.player_to_move = room.player_to_move == 1 ? 2 : 1;
        moves[id] = symbol;

        let obj = { id: id, symbol: symbol };
        if (checkWinner(id, moves)) {
          room.game_status = false;

          obj.game_won = symbol;
        }

        action.emitAll('put_symbol', obj);
        action.emitAll('setActivePlayer', room.player_to_move);
      }
    }
  });
});

io.listen(8000);

function makeid(length) {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class Actions {
  constructor(socket) {
    this.socket = socket;
  }

  emitAll(event_name, value) {
    const roomName = rooms[this.socket.id];
    // Send this event to everyone in the room.
    io.sockets.in(roomName).emit(event_name, JSON.stringify(value));
  }
  emitOthers(event_name, value) {
    const roomName = rooms[this.socket.id];
    // Send this event to everyone in the room except self
    this.socket.broadcast.to(roomName).emit(event_name, JSON.stringify(value));
  }
}

function countMatches(id, moves, step, v_direction = 0) {
  let symbol = moves[id];
  let item_id = id;
  let count = 0;

  for (let i = 0; i <= 2; i++) {
    item_id = item_id + step;
    if (
      moves.hasOwnProperty(item_id) &&
      symbol == moves[item_id] &&
      (v_direction === false ||
        getRow(item_id - step) + v_direction == getRow(item_id))
    ) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

function checkWinner(id, moves) {
  /**START Horizontal */
  let count = countMatches(id, moves, -1);
  if (count == 3) {
    return true;
  }
  count += countMatches(id, moves, 1);
  if (count >= 3) {
    return true;
  }
  /**END Horizontal */

  /**START Dioganal1 */
  count = countMatches(id, moves, -9, -1);
  if (count == 3) {
    return true;
  }

  count += countMatches(id, moves, 9, 1);
  if (count >= 3) {
    return true;
  }
  /**END Dioganal1 */

  /**START Dioganal2 */
  count = countMatches(id, moves, -11, -1);
  if (count == 3) {
    return true;
  }

  count += countMatches(id, moves, 11, 1);
  if (count >= 3) {
    return true;
  }
  /**END Dioganal2 */

  count = countMatches(id, moves, 10, false);
  if (count == 3) {
    return true;
  }

  return false;
}

function getRow(id) {
  col = id % 10;
  return (id - col) / 10;
}
