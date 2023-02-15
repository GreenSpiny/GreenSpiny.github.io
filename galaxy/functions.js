//python -m http.server
// ------------------------------------------------------ //
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

// ------------------------------------------------------ //
const cardsUrl = "cards.json";
var cardsData = null;
const comboUrl = "combos-list.json";
var comboData = null;

var cardCount = 0;

function PopulateCombos(targetDiv, targetComboType, minUnits)
{
  const comboArea = targetDiv;

  var comboCount = 0;
  for (let combo of comboData[targetComboType])
  {
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

    // title
    const titleElement = document.createElement("p");
    titleElement.setAttribute("class", "header-text");
    titleElement.innerHTML = combo["name"];
    comboDiv.appendChild(titleElement);

    // subtitle
    const notes = combo["notes"];
    if (notes != null)
    {
      const notesElement = document.createElement("p");
      notesElement.setAttribute("class", "major-text");
      notesElement.innerHTML = combo["notes"];
      comboDiv.appendChild(notesElement);
    }

    // reqs
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

    // start
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

    
    // arrow
    if (combo["end"].length > 0)
    {
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "arrow borderless"));
    }

    // end
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

    
    // bonuses
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

    // path
    comboDiv.insertAdjacentHTML("beforeend", pathTemplate);
    const ol = comboDiv.getElementsByTagName("ol")[0];
    const splitPath = combo["path"].split(".");
    for (let i = 0; i < splitPath.length - 1; i++)
    {
      ol.insertAdjacentHTML("beforeend", "<li class='mono-text'>" + splitPath[i] + ".</li>");
    }

    // extra padding
    const diff = minUnits - cardsInCombo;
    for (let i = 0; i < diff; i++)
    {
      cardArea.insertAdjacentHTML("afterbegin", cardTemplate.replace("YYY", "card-img borderless blank-half"));
      cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", "card-img borderless blank-half"));
    }
  }
}

// ------------------------------------------------------ //
function ComboButtonFunc(number)
{
  const num = String(number);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("tab", num);

  const localUrl = window.location.href.split("?")[0];
  if (localUrl.includes("combos"))
  {
    window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
    for (const child of document.getElementById("center-column").getElementsByClassName("combo-area")) {
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
    LoadUrl("combos.html?tab=" + num);
  }
}

const CardPriorityDict = 
{
  "effect": 0,
  "spell": 1,
  "trap": 2,
  "link": 3,
  "xyz": 4
}

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

function PopulateRatings()
{
  const ratingDivs = document.getElementsByClassName("ratings-container");
  const cardObjects = [];

  for (let i = 0; i < ratingDivs.length; i++)
  {
    cardObjects[i] = [];
  }

  for (let key of Object.keys(cardsData))
  {
    const card = cardsData[key];
    const rating = card["rating"];
    if (rating > 0)
    {
      cardObjects[card["rating"] - 1].push(card);
    }
  }

  for (let i = 0; i < cardObjects.length; i++)
  {
    cardObjects[i].sort(CompareCards);
    for (let card of cardObjects[i])
    {
      if (card["rating"] != 0)
      {
        const image = document.createElement("img");
        image.setAttribute("src", "images/cropped-small/" + card["image"] + ".jpg");
        image.setAttribute("class", "ratings-image " + card["type"]);
        image.setAttribute("card-id", card["id"]);
        image.setAttribute("onclick", "GetRating(this)");
        ratingDivs[i].appendChild(image);
      }
    }
  }
}

function GetRating(self)
{
  const cardId = self.getAttribute("card-id");
  const card = cardsData[cardId];

  const ratingImage = document.getElementById("analysis-image");
  ratingImage.style.display = "block";
  ratingImage.setAttribute("onload", "ScrollToRatingText()");
  ratingImage.setAttribute("src", "images/full/" + card["image"] + ".jpg");

  const ratingText = document.getElementById("analysis-text");
  var ratingCount = "<span class='header-text'>" + card["name"] + " ☆".repeat(4 - card["rating"]) + "<br></span>";
  ratingCount += "<span class='major-text'>Recommended: " + card["count"] + "<br></span>";
  ratingText.innerHTML = ratingCount + card["analysis"];
}

async function ScrollToRatingText()
{
  setTimeout(() => {
    ScrollIntoView(document.getElementById("analysis-text"));
  }, 100);
}

function ScrollIntoView(obj)
{
  obj.scrollIntoView({behavior: "smooth", block:"start"});
}

// ------------------------------------------------------ //
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
      
      var tab = 2;
      if (params["tab"] != null)
      {
        tab = params["tab"];
      }

      ComboButtonFunc(tab);

      cardCount = 0;
      PopulateCombos(document.getElementById("card-combos-1"), "1-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-2"), "2-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-3"), "3-card-combos", 5);
      PopulateCombos(document.getElementById("card-combos-4"), "spicy-combos", 5);

    });
  });
}

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

// ------------------------------------------------------ //
function ToggleButton(self)
{
  var content = self.nextElementSibling;
  if (content.style.display === "block")
  {
   self.innerHTML =self.innerHTML.replace("▲", "▼");
    content.style.display = "none";
  }
  else
  {
    self.innerHTML =self.innerHTML.replace("▼", "▲");
    content.style.display = "block";
  }
}

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

function CloseAllDropdowns()
{
  var dropdowns = document.getElementsByClassName("inner-nav-dropdown");
  for (let i = 0; i < dropdowns.length; i++)
  {
    dropdowns[i].style.display = "none";
  }
}

function LoadUrl(url)
{
  window.location.assign(url);
}

// ------------------------------------------------------ //

window.onclick = function(event) {
  if (!event.target.matches('.nav-dropdown-button')) {
    CloseAllDropdowns();
  }
}