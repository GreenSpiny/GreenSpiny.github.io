// python -m http.server
// ^ helpful command for testing on a local python server.

// https://www.galaxy-eyes.de
// ^ the original website built off this template, for reference.

// ----- HTML TEMPLATES ----- //
const cardTemplate = `
<div id="XXX" class="card">
  <img class="card-img YYY">
  <div class="sub-card-area"></div>
</div>
`;

const pathTemplate = `
<button class="path-button button-text" onclick="ToggleButton(this)">Combo Path ▼</button>
<div class="path-desc-area">
  <ol></ol>
</div>
`;

const articleButtonTemplate = `
  <button class="XXX" onclick="ExpandButton(this)">▼ YYY ▼</button>
`

const matchupTemplate = `
<div class="image-bullet-div minor-text" >
  <img class="image-bullet-img XXX">
  YYY
</div>
`;

// ----- TOP LEVEL DATA VARIABLES ----- //

const cardsUrl = "cards.json";
var cardsData = null;
var cardCount = 0;

const comboUrl = "combos-list.json";
var comboData = null;

const matchupsUrl = "matchups.json"
var matchupsData = null;

const quizUrl = "quiz.json"
var quizData = null;
var quizQuestion = 0;

// ----- GENERAL FUNCTIONS -----//

// Construct visual combos from combo data.
// A long and complicated function.
function PopulateCombos(targetDiv, targetComboType, minUnits)
{
  const comboArea = targetDiv;
  var comboCount = 0;

  // Each combo read from the JSON data must be parsed.
  for (let combo of comboData[targetComboType])
  {
    // high level initialization
    cardsInCombo = 0;
    const comboDiv = document.createElement("div");
    comboDiv.setAttribute("id", combo["name"]);
    if (comboCount == 0)
    {
      comboDiv.setAttribute("class", "combo combo-top");
    }
    else
    {
      comboDiv.setAttribute("class", "combo");
    }
    comboCount++;
    comboArea.appendChild(comboDiv);

    // title text
    const titleElement = document.createElement("p");
    titleElement.setAttribute("class", "header-text");
    titleElement.innerHTML = combo["name"];
    comboDiv.appendChild(titleElement);

    // subtitle text
    const notes = combo["notes"];
    if (notes != null)
    {
      const notesElement = document.createElement("p");
      notesElement.setAttribute("class", "major-text");
      notesElement.innerHTML = combo["notes"];
      comboDiv.appendChild(notesElement);
    }

    // requirements text
    const reqs = combo["reqs"];
    if (reqs.length > 0)
    {

      const reqsElement = document.createElement("div");
      reqsElement.setAttribute("class", "reqs-area");
      reqsElement.innerHTML = "<p class='minor-text'><i>requirements: <span class='alert'>" + combo["reqs"] + "</span></i></p>";
      comboDiv.appendChild(reqsElement);
    }

    // card area
    const cardArea = document.createElement("div");
    cardArea.setAttribute("class", "card-area");
    comboDiv.appendChild(cardArea);

    // start (the left side of a combo)
    // Mini images are any small card images embedded inside the larger image.
    const start = combo["start"].split(',');
    for (let i = 0; i < start.length; i++)
    {
      cardCount++;
      cardsInCombo++;
      const startParts = start[i].split('|');
      const currentId = "_card" + String(cardCount);
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", currentId));
      const currentDiv = document.getElementById(currentId)
      
      const mainImg = currentDiv.getElementsByClassName("card-img")[0];
      const mainData = cardsData[startParts[0]];
      mainImg.setAttribute("title", mainData["name"]);
      mainImg.setAttribute("src", "images/cropped-small/" + mainData["image"] + ".jpg");

      const subArea = currentDiv.getElementsByClassName("sub-card-area")[0];
      for (let j = 1; j < startParts.length; j++)
      {
        const miniImage = document.createElement("img");
        const miniData = cardsData[startParts[j]];
        miniImage.setAttribute("class", "sub-card " + miniData["id"] + "-sub");
        miniImage.setAttribute("title", miniData["name"]);
        subArea.appendChild(miniImage);
      }
    }
    
    // arrow (the middle delineation of a combo)
    if (combo["end"].length > 0)
    {
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "arrow borderless"));
    }

    // end (the right side of a combo)
    // Mini images are any small card images embedded inside the larger image.
    const end = combo["end"].split(',');
    for (let i = 0; i < end.length; i++)
    {
      cardCount++;
      cardsInCombo++;
      const endParts = end[i].split('|');
      const currentId = "_card" + String(cardCount);
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", currentId));
      const currentDiv = document.getElementById(currentId)
      
      const mainImg = currentDiv.getElementsByClassName("card-img")[0];
      const mainData = cardsData[endParts[0]];
      mainImg.setAttribute("title", mainData["name"]);
      mainImg.setAttribute("src", "images/cropped-small/" + mainData["image"] + ".jpg");

      const subArea = currentDiv.getElementsByClassName("sub-card-area")[0];
      for (let j = 1; j < endParts.length; j++)
      {
        const miniImage = document.createElement("div");
        const miniData = cardsData[endParts[j]];
        miniImage.setAttribute("class", "sub-card " + miniData["id"] + "-sub");
        miniImage.setAttribute("title", miniData["name"]);
        subArea.appendChild(miniImage);
      }
    }

    // bonuses (the far right of the combo)
    // If you want to put custom items on the right side of your combo similar to how Galaxy places its banish and cipher data...
    // ... you will need to edit the code here for your own purposes.
    if (combo["banishes"] > 0 || combo["cipher"])
    {
      var className = "hundred-";
      className += String(combo["banishes"]);
      if (combo["cipher"])
      {
        className += "-ex";
      }
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "card-img borderless " + className));
    }
    else
    {
      cardArea.insertAdjacentHTML("afterbegin", cardTemplate.replace("YYY", "card-img borderless blank-quarter"));
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "card-img borderless blank-quarter"));
    }

    // expandable path section beneath the combo
    comboDiv.insertAdjacentHTML("beforeend", pathTemplate);
    const ol = comboDiv.getElementsByTagName("ol")[0];
    const splitPath = combo["path"].split(".");
    for (let i = 0; i < splitPath.length - 1; i++)
    {
      var period = '.';
      const trimmedPath = splitPath[i].trim();
      if (trimmedPath[0] == "-")
      {
        period = '';
      }
      ol.insertAdjacentHTML("beforeend", "<li class='mono-text'>" + trimmedPath + period + "</li>");
    }

    // extra padding to widen the combo to be a fixed width
    // The amount of padding depends on the number of visual elements in the combo.
    const diff = minUnits - cardsInCombo;
    for (let i = 0; i < diff; i++)
    {
      cardArea.insertAdjacentHTML("afterbegin", cardTemplate.replace("YYY", "card-img borderless blank-half"));
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "card-img borderless blank-half"));
    }
  }
}

// Construct visual matchups from matchup data.
function PopulateMatchups()
{
  const matchupDiv = document.getElementById("matchups-area");
  console.log(matchupsData);

  for (let i = 0; i < matchupsData.length; i++)
  {
    var currentMatchup = matchupsData[i];
    var buttonHTML = articleButtonTemplate;
    buttonHTML = buttonHTML.replace("XXX", "article-button article-button-text " + currentMatchup.background);
    buttonHTML = buttonHTML.replace("YYY", currentMatchup.name);
    matchupDiv.insertAdjacentHTML("beforeend", buttonHTML);

    var matchupElement = document.createElement("div");
    matchupElement.setAttribute("class", "article-div left");
    matchupDiv.appendChild(matchupElement);

    allEntriesHTML = "";
    for (let j = 0; j < currentMatchup.entries.length; j++)
    {
      var currentEntry = currentMatchup.entries[j];
      var entryHTML = matchupTemplate;
      entryHTML = entryHTML.replace("XXX", currentEntry.image + "-cropped");
      entryHTML = entryHTML.replace("YYY", currentEntry.text);
      allEntriesHTML += entryHTML;
    }

    matchupElement.innerHTML = allEntriesHTML;
  }

}

// Cards in the Ratings section have different types, which are defined here.
const CardPriorityDict = 
{
  "effect": 0,
  "spell": 1,
  "trap": 2,
  "link": 3,
  "xyz": 4
}

// Sorting function for any two cards in the Ratings section.
function CompareCards(a, b)
{
  const aType = CardPriorityDict[a["type"]];
  const bType = CardPriorityDict[b["type"]];
  if (aType != bType)
  {
    return aType - bType;
  }
  if (a["priority"] != b["priority"])
  {
    return a["priority"] - b["priority"];
  }
  return a["name"].localeCompare(b["name"]);
}

// Construct visual ratings from card ratings data.
function PopulateRatings()
{
  const ratingDivs = document.getElementsByClassName("ratings-container");
  const cardObjects = [];

  for (let i = 0; i < ratingDivs.length; i++)
  {
    cardObjects[i] = [];
  }

  // Read in the cards from the JSON data.
  for (let key of Object.keys(cardsData))
  {
    const card = cardsData[key];
    const rating = card["rating"];
    if (rating > 0)
    {
      cardObjects[card["rating"] - 1].push(card);
    }
  }

  // After sorting the cards, create rows of images which, on click, call the GetRating() function.
  for (let i = 0; i < cardObjects.length; i++)
  {
    cardObjects[i].sort(CompareCards);
    for (let card of cardObjects[i])
    {
      if (card["rating"] != 0)
      {
        const image = document.createElement("img");
        image.setAttribute("src", "images/cropped-small/" + card["image"] + ".jpg");
        image.setAttribute("id", "card-" + card["id"]);
        image.setAttribute("class", "ratings-image " + card["type"]);
        image.setAttribute("card-id", card["id"]);
        image.setAttribute("onclick", "GetRating(this, true)");
        ratingDivs[i].appendChild(image);
      }
    }
  }
  
}

// The on click function of images in the Card Ratings section.
// Take the "card-id" stored in the object and read card data into the analysis area.
function GetRating(self, scroll)
{
  const cardId = self.getAttribute("card-id");
  const card = cardsData[cardId];
  const ratingImage = document.getElementById("analysis-image");
  ratingImage.style.display = "block";

  // scrolling behavior
  if (scroll)
  {
    ratingImage.setAttribute("onload", "ScrollToRatingText()");
  }

  ratingImage.setAttribute("src", "images/full/" + card["image"] + ".jpg");
  const ratingText = document.getElementById("analysis-text");
  var ratingCount = "<span class='header-text'>" + card["name"] + " ☆".repeat(4 - card["rating"]) + "<br></span>";
  ratingCount += "<span class='major-text'>Recommended: " + card["count"] + "<br></span>";
  ratingText.innerHTML = ratingCount + card["analysis"];
}

// Forcibly scroll down to the analysis in the Card Ratings section. Called after the full image loads.
async function ScrollToRatingText()
{
  setTimeout(() => {
    ScrollIntoView(document.getElementById("analysis-text"));
  }, 100);
}

// Defined scroll behavior type.
function ScrollIntoView(obj)
{
  obj.scrollIntoView({behavior: "smooth", block:"start"});
}

function PopulateQuiz()
{

}

function DisplayQuizQuestion(question)
{
  // Reset display
  if (quizQuestion < 0)
  {

  }

  // Display question
  else if (quizQuestion < quizData.length)
  {
    quizQuestion = question;
  }

  // Display results
  else
  {

  }
}

// Switch to the correct section of a page based on the current url (i.e. "...?tab=2")
// Used on multiple pages, and finds targets based on the children of "tab-area".
// NEEDS OPTIMIZATION!
function TabFunction(number, page)
{
  const num = String(number);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("tab", num);

  const localUrl = window.location.href.split("?")[0];
  if (localUrl.includes(page))
  {
    window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
    for (const child of document.getElementById("center-column").getElementsByClassName("tab-area")) {
      if (child.getAttribute("id").endsWith(num))
      {
        child.removeAttribute("hidden");
        document.getElementById("title").innerHTML = child.getAttribute("data");
      }
      else
      {
        child.setAttribute("hidden", true);
      }
    }
  }
  else
  {
    LoadUrl(page + "?tab=" + num);
  }
}

// Load URL helper function.
function LoadUrl(url)
{
  window.location.assign(url);
}

// ------ PAGE INITIALIZATION FUNCTIONS ------ //

// Called on load of the Combos page.
// Asynchronously download the combos and cards JSON data from the server.
// Switch to the correct combo section based on the current url. (i.e. "...?tab=2")
async function InitializeCombos()
{
  const cardsRequest = new Request(cardsUrl, { cache: "no-cache" });
  const cardsPromise = fetch(cardsRequest);

  const comboRequest = new Request(comboUrl, { cache: "no-cache" });
  const comboPromise = fetch(comboRequest);

  Promise.all([cardsPromise, comboPromise]).then((results1) => {

    const caJsonPromise = results1[0].json();
    const coJsonPromise = results1[1].json();

      Promise.all([caJsonPromise, coJsonPromise]).then((results2) => {

      cardsData = results2[0];
      comboData = results2[1];

      const urlParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlParams.entries());
      
      var tab = 1;
      if (params["tab"] != null)
      {
        tab = params["tab"];
      }

      TabFunction(tab, "combos");

      cardCount = 0;
      PopulateCombos(document.getElementById("card-combos-1"), "1-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-2"), "2-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-3"), "3-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-4"), "last-hope-combos", 5);
      PopulateCombos(document.getElementById("card-combos-5"), "spicy-combos", 5);

    });
  });
}

// Called on load of the Card Ratings page.
// Asynchronously download the cards JSON data from the server.
async function InitializeRatings()
{
  const cardsRequest = new Request(cardsUrl, { cache: "no-cache" });
  const cardsPromise = fetch(cardsRequest);
  Promise.all([cardsPromise]).then((results1) => {
    const caJsonPromise = results1[0].json();
      Promise.all([caJsonPromise]).then((results2) => {
      cardsData = results2[0];
      PopulateRatings();
    });
  });
}

// Called on load of the Matchups page.
// Asynchronously download the matchups JSON data from the server.
async function InitializeMatchups()
{
  const matchupsRequest = new Request(matchupsUrl, { cache: "no-cache" });
  const matchupsPromise = fetch(matchupsRequest);
  Promise.all([matchupsPromise]).then((results1) => {
    const muJsonPromise = results1[0].json();
      Promise.all([muJsonPromise]).then((results2) => {
      matchupsData = results2[0];
      PopulateMatchups();
    });
  });
}

// Called on load of the Quiz page.
// Asynchronously download the quiz JSON data from the server.
async function InitializeQuiz()
{
  const quizRequest = new Request(quizUrl, { cache: "no-cache" });
  const quizPromise = fetch(quizRequest);
  Promise.all([quizPromise]).then((results1) => {
    const quJsonPromise = results1[0].json();
      Promise.all([quJsonPromise]).then((results2) => {
      quizData = results2[0];
      PopulateQuiz();
    });
  });
}

// Called on load of the Decks page.
// Switch to the correct decks section based on the current url. (i.e. "...?tab=2")
async function InitializeDecks()
{
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  var tab = 1;
  if (params["tab"] != null)
  {
    tab = params["tab"];
  }
  TabFunction(tab, "decks.html");
}

// ----- UI BUTTON FUNCTIONS ----- //

// Expandable button function with no transition.
function ToggleButton(self)
{
  var content = self.nextElementSibling;
  if (content.style.display === "block")
  {
   self.innerHTML =self.innerHTML.replaceAll("▲", "▼");
    content.style.display = "none";
  }
  else
  {
    self.innerHTML =self.innerHTML.replaceAll("▼", "▲");
    content.style.display = "block";
  }
}

// Expandable button function with a linear transition.
function ExpandButton(self)
{
  var content = self.nextElementSibling;
  if (self.innerHTML.includes("▲"))
  {
    self.innerHTML = self.innerHTML.replaceAll("▲", "▼");
    content.style.transitionDuration = "0s";
    content.style.maxHeight = "0";
  }
  else
  {
    self.innerHTML =self.innerHTML.replaceAll("▼", "▲");
    content.style.transitionDuration = "4s";
    content.style.maxHeight = "10000px";
  }
}

// Dropdown button functionality for the main menu.
function DropdownButton(self)
{
  CloseAllDropdowns();
  var content = self.nextElementSibling;
  if (content != null)
  {
    if (content.style.display === "block")
    {
      content.style.display = "none";
    }
    else
    {
      content.style.display = "block";
    }
  }
}

// When choosing a menu button, close all other menu buttons.
function CloseAllDropdowns()
{
  var dropdowns = document.getElementsByClassName("inner-nav-dropdown");
  for (let i = 0; i < dropdowns.length; i++)
  {
    dropdowns[i].style.display = "none";
  }
}

// When clicking outside the menu, close all other menu buttons.
window.onclick = function(event) {
  if (!event.target.matches('.nav-dropdown-button')) {
    CloseAllDropdowns();
  }
}