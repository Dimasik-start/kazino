let играть = document.getElementById("games-section");
let профиль = document.getElementById("profiles");
let задание = document.getElementById("qwest");
let пополнение = document.getElementById("kripta");

let кнопкаиграть = document.getElementById("nav-play");
let кнопкапрофиль = document.getElementById("nav-profile");
let кнопказадание = document.getElementById("nav-tasks");
let кнопкапополнение = document.getElementById("nav-deposit");

function спрятатьвсе() {
    играть.style.display = "none"
    профиль.style.display = "none"
    задание.style.display = "none"
    пополнение.style.display = "none"
}
function раздел(selection) {
    console.log("раздел вызван с параметром: " + selection);
    спрятатьвсе();
    if (selection === "games") {
        играть.style.display="block";
    }
    if (selection === "profile") {
        профиль.style.display="block";
    } 
    if (selection==="tasks") {
        задание.style.display="block";
    }
    if (selection==="deposit") {
        пополнение.style.display="block";
    }

}
кнопкаиграть.addEventListener("click", function() {
    раздел("games");
})
кнопкапрофиль.addEventListener("click", function() {
    раздел("profile");
})
кнопказадание.addEventListener("click", function() {
    раздел("tasks");
})
кнопкапополнение.addEventListener("click", function() {
    раздел("deposit");
})
