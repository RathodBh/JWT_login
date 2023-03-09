const portCardContainer = document.querySelector('#portCard');
const portAllCards = document.querySelectorAll('#portCard > div');
let cols = parseInt(portCardContainer.getAttribute('data-cols'));

let portCards = portAllCards.length;
let per = 0;
let i = 0;
let totPer = 100/cols;
portAllCards.forEach((card) => {
    card.classList.add(`col-${cols}`);
})


function portPrev(){
    ++i;
    per += totPer;
    if(i > 1){
        portCardContainer.style.transform = `translateX(0%)`;
        i=0
        per = 0
    }
    else{
        portCardContainer.style.transform = `translateX(${per}%)`;

    }
}
function portNext(){
    --i
    per -= totPer;
    if(Math.abs(i) == portCards-1){
        portCardContainer.style.transform = `translateX(0%)`;
        i=0
        per = 0
    }
    else{
        portCardContainer.style.transform = `translateX(${per}%)`;

    }
    
}


// testimonials cards
const testCardContainer = document.querySelector('#testimonials-cards');
const testAllCards = document.querySelectorAll('#testimonials-cards > .col');
let test_cols = parseInt(testCardContainer.getAttribute('data-cols'));

let testCards = testAllCards.length;
let test_pr = 0;
let test_i = 0;
let test_totPer = 100/test_cols;
testAllCards.forEach((card) => {
    card.classList.add(`col-${test_cols}`);
})


function testPrev(){
    ++test_i;
    test_pr += test_totPer;
    if(test_i > 1){
        testCardContainer.style.transform = `translateX(0%)`;
        test_i=0
        test_pr = 0
    }
    else{
        testCardContainer.style.transform = `translateX(${test_pr}%)`;

    }
}
function testNext(){
    --test_i;
    test_pr -= test_totPer;
    if(Math.abs(test_i) == testCards-1){
        testCardContainer.style.transform = `translateX(0%)`;
        test_i=0
        test_pr = 0
    }
    else{
        testCardContainer.style.transform = `translateX(${test_pr}%)`;

    }
    
}
