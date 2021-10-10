<!doctype html>
<link rel="stylesheet" href="style.css">


<h2>Four in line multiplayer  
  <div class="room">
    <span class="game_code_text"></span>
    <button class="btn" id="copy-btn" title="copy url">Copy room's url</button>
  </div>
  <input class="game_code" id="input" type="text" readonly/>
  <span class="player"></span>
</h2>

<div class="start_game">
    <button class="btn" id="new_game">New Game</button>


    <form action="" id="join_game">
        <input type="text" name="game_code">
        <button class="btn" id="join-btn" type="submit">Join Room</button>
    </form>
</div>

<ol class="instructions">
  <li>Start a new game</li>
  <li>Copy and share the room's link with a friend</li>
  <li>Play</li>
</ol>

<!-- <table class="results">
  <tr>
    <td>Player X</td>
    <td>Player O</td>
  </tr>
  <tr>
    <td class="x_result"></td>
    <td class="o_result"></td>
  </tr>
</table> -->

<script>
  function copy() {
    var copyText = document.querySelector("#input");
    copyText.select();
    document.execCommand("copy");
  } 
  document.querySelector("#copy-btn").addEventListener("click", copy);
</script>



<div class="game_block">
    <p class="message"></p>
    <div class="game_board four-in-line">
        <?php
        for($i = 0; $i <= 99; $i++) {
            echo "<a data-id='$i' href='#'></a>";
        }
        ?>
    </div>
    <a href="#" class="btn" id="resign-btn">Resign</a>
    <a href="#" class="btn" id="start-btn">Start New</a>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
<script src="script.js"></script>