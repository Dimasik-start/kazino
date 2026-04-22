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

function убратьвсе() {
    кнопкаиграть.classList.remove("active");
    кнопкапрофиль.classList.remove("active");
    кнопказадание.classList.remove("active");
    кнопкапополнение.classList.remove("active");
}
function раздел(selection) {
    console.log("раздел вызван с параметром: " + selection);
    спрятатьвсе();
    убратьвсе();
    if (selection === "games") {
        играть.style.display="block";
        кнопкаиграть.classList.add("active");
    }
    if (selection === "profile") {
        профиль.style.display="block";
        кнопкапрофиль.classList.add("active");
    } 
    if (selection==="tasks") {
        задание.style.display="block";
        кнопказадание.classList.add("active");
    }
    if (selection==="deposit") {
        пополнение.style.display="block";
        кнопкапополнение.classList.add("active")
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

let кнопкаплюс = document.getElementById("depositBtn")
кнопкаплюс.addEventListener("click", function() {
    раздел("deposit");
})
