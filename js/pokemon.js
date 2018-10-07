/* ---------------------------------------------------------------------------------- 
Declare global variables
---------------------------------------------------------------------------------- */

let score;
let randomNum;
let pokemon;
let pokemonSeen = 0;

/* ---------------------------------------------------------------------------------- 
Hide preloader on page load
---------------------------------------------------------------------------------- */

$(window).on('load', function() { 
    $('#preloader').delay(350).fadeOut('slow');
})

/* ---------------------------------------------------------------------------------- 
Grab the Pokemon data from the JSON file and place it in a variable 
---------------------------------------------------------------------------------- */

$.getJSON("js/questions.json", function(data){
    pokemon = data;
})

/* ---------------------------------------------------------------------------------- 
Declare a variable with an array for used Pokemon
---------------------------------------------------------------------------------- */

let usedPokemon = [];

/* ---------------------------------------------------------------------------------- 
Begin the game when the start button has been clicked
---------------------------------------------------------------------------------- */

$( "#start-game" ).on('click', startGame);

/* ---------------------------------------------------------------------------------- 
Upon beginning the game:
    - Set player's score to 0
    - fade in the game board and fade out the intro
---------------------------------------------------------------------------------- */

function startGame() {
    score = 0;
    pokemonSeen = 0; 
    newRandomNum();                                                                                                                                     
    $( "#game" ).fadeIn();
    $( "#intro" ).fadeOut();
    $( "#footer" ).fadeOut();
}

/* ---------------------------------------------------------------------------------- 
Get a new random number
---------------------------------------------------------------------------------- */

function newRandomNum() {
    randomNum = Math.floor(Math.random() * pokemon.questions.length);
    newPokemon();
}

function newPokemon() {

/* ---------------------------------------------------------------------------------- 
If a player has seen 20 Pokémon:
    - fade out the game board
    - show the "message" modal
    - display the final score & social share buttons within the modal
    - hide modal and display title screen when "OK" button is clicked
---------------------------------------------------------------------------------- */

    if (pokemonSeen == 20) {
        let percent = score * 5;
        $( ".modal-body" ).html( `
            <p class="text-center">Your final score is:</p>
            <h2 class="text-center">${percent}%</h2>
            <p class="share-buttons text-center">
                <span id="twitterlink"></span>&nbsp;&nbsp;
                <button id="fbLink" class="btn btn-md"><span class="fab fa-facebook-square"></span> Share</button>
            </p>
        ` );
        $( ".modal-footer" ).html( `<button type="button" id="score-ok" class="btn btn-primary" data-dismiss="modal">OK</button>` );
        $( "#game" ).fadeOut();
        $( "#message" ).modal();
        $( "#score-ok" ).on( "click", function() {
            resetPokemon();
        });

        $( document ).ready(function() {
            var link = document.createElement('a');
            link.setAttribute('href', 'https://twitter.com/');
            link.setAttribute('class', 'twitter-share-button');
            link.setAttribute('id', 'twitterbutton');
            link.setAttribute("data-text", 'I got a score of ' + percent + '% playing Who\'s That Pokémon! Take the test for yourself and see if you can beat my score.' );
            link.setAttribute("data-url", 'https://danielbeehn.github.io/whosthatpokemon' );
            link.setAttribute("data-size", 'large');
        
            tweetdiv  =  document.getElementById('twitterlink');
            tweetdiv.appendChild(link);
    
            twttr.widgets.load(); //very important
    
        });

        document.getElementById('fbLink').onclick = function() {

            FB.ui({
                display: 'popup',
                method: 'share',
                title: 'I got a score of ' + percent + '% playing Who\'s That Pokemon!',
                description: 'Take the test for yourself and see if you can beat my score.',
                picture: 'https://danielbeehn.github.io/whosthatpokemon/img/open-graph.jpg',
                href: 'https://danielbeehn.github.io/whosthatpokemon',
        
            }, function(response){}); 
        }
    }

/* ---------------------------------------------------------------------------------- 
If a player has not yet seen 20 Pokémon:
    - change image to Pokemon's shadow
    - reset the form
    - take the form out of read-only mode and display question
    - make "submit" button visible
    - increment the "Pokémon Seen" counter by 1 and display number in counter
    - listen for clicks on the "hint" and "skip" buttons
---------------------------------------------------------------------------------- */

    else {
        let pokeImg = 'img/shadows/' + pokemon.questions[randomNum].number + '.png';
        let revealImg = 'img/reveal/' + pokemon.questions[randomNum].number + '.png';
        $( "#pokemon-img" ).attr( "src", pokeImg );
        $( "#pokemon-reveal" ).attr( "src", revealImg );
        $( "#player-guess" ).attr( "readonly", false ).removeClass( "correct-guess" ).attr( "placeholder", "Who\'s that Pokémon?" );
        $( "#name-submit" )[0].reset();
        $( "#submit" ).css( "opacity", 1 );
        pokemonSeen++;
        $( "#counter ").html( `<p>${pokemonSeen} of 20</p>`);
        $( "#hint" ).on( "click", displayHint );
        $( "#skip" ).on( "click", skipPokemon );
    }
}

/* ---------------------------------------------------------------------------------- 
Grab the hint from the Pokémon array and display it inside the modal window
---------------------------------------------------------------------------------- */

function displayHint() {
    let hintText = pokemon.questions[randomNum].hint;
    $( ".modal-body" ).html( `<p>${hintText}</p>` );
    $( ".modal-footer" ).html( `<button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>` );
}

/* ---------------------------------------------------------------------------------- 
Display a confirmation asking if the user would like to skip the current Pokémon,
if yes, remove Pokémon from "questions" array so it can't be used again and 
display a new one
---------------------------------------------------------------------------------- */

function skipPokemon() {
    $( ".modal-body" ).html( `<p>Are you sure you want to skip this Pokémon?</p>` );
    $( ".modal-footer" ).html( `<button type="button" id="skip-false" class="btn btn-secondary" data-dismiss="modal">No</button>
    <button type="button" id="skip-true" class="btn btn-primary" data-dismiss="modal">Yes</button>` );
    $( "#skip-true" ).on( "click", function() {
        removePokemon();
        setTimeout( newRandomNum, 400 );
    });
}

/* ---------------------------------------------------------------------------------- 
Remove Pokémon from "questions" array so it can't be used again
---------------------------------------------------------------------------------- */

function removePokemon() {
    usedPokemon.push(pokemon.questions[randomNum]);
    let used = pokemon.questions.indexOf(pokemon.questions[randomNum]);
    if (used > -1) {
        pokemon.questions.splice(used, 1);
    }
}

/* ---------------------------------------------------------------------------------- 
Set variables for player's input, Pokémon's name and reveal image
---------------------------------------------------------------------------------- */

function playerGuess() {
    let playerInput = $( "#player-guess").val().toUpperCase();
    let pokemonName = pokemon.questions[randomNum].name.toUpperCase();
    let revealImg = 'img/reveal/' + pokemon.questions[randomNum].name + '.png';

/* ---------------------------------------------------------------------------------- 
If the player's guess is a match:
    - reveal the Pokémon
    - display answer in form and set it to read-only
    - remove the "submit" button
    - increment score by 1
    - remove Pokémon from "questions" array so it can't be used again
    - display a new Pokémon after 5 seconds
---------------------------------------------------------------------------------- */

    if (playerInput == pokemonName) {
        $( "#pokemon-img" ).attr( "src", revealImg );
        $( "#player-guess" ).addClass( "correct-guess" ).attr( "placeholder", `Correct, it's ${pokemonName}!` ).attr( "readonly", true );;
        $( "#name-submit" )[0].reset();
        $( "#submit" ).css( "opacity", 0 );
        score++
        removePokemon();
        setTimeout( newRandomNum, 5000 );
}

/* ---------------------------------------------------------------------------------- 
If the player enters nothing into the box:
     - display reminder to enter a value in the form
---------------------------------------------------------------------------------- */

    else if (playerInput == "") {
        $( "#player-guess" ).attr( "placeholder", "Please type an answer." );
        $( "#hint" ).on( "click", displayHint );
    }

 /* ---------------------------------------------------------------------------------- 
If the player's guess does not match and still has guesses remaining:
    - display "incorrect" message
    - hide "submit" button
    - remove "wrong guess" styling and restore "submit" button on keypress
---------------------------------------------------------------------------------- */

    else if (playerInput != pokemonName) {
        $( "#player-guess" ).addClass( "wrong-guess" ).attr( "placeholder", "Incorrect. Try again." );
        $( "#name-submit" )[0].reset();
        $( "#submit" ).css( "opacity", 0 );
        $( "#player-guess" ).on( "keypress", function() {
            $( "#player-guess" ).removeClass( "wrong-guess" );
            $( "#submit" ).css( "opacity", 1 );
        })
    }
}

/* ---------------------------------------------------------------------------------- 
Loop through all of the Pokemon in the "used Pokemon" array, add them back to
the "questions" array, fade out the game board, and fade in the intro screen
---------------------------------------------------------------------------------- */

function resetPokemon() {
    for (let i = 0; i < usedPokemon.length; i++) {
        pokemon.questions.push(usedPokemon[i]);
    }
    usedPokemon = [];
    $( "#intro" ).fadeIn();
}