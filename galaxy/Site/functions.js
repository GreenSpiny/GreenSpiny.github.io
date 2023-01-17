//python -m http.server
// ------------------------------------------------------ //
const comboAreaTemplate = `
<div class="combo-area">
  <p class="combo-text-title"></p>
  <div class="combo-insertion-area">

  </div>
  <div class="combo-description">
    <button type="button" class="collapsible">Combo Path ▼</button>
    <div class="combo-description-content">

    </div>
  </div>
</div>
`;

const comboVisualAreaTemplate = `<div class="image-shell"></div>`;
const comboImageTemplate = `<img class="combo-image Z"><div class="combo-area-sub"></div>`;

// ------------------------------------------------------ //
const url = "combos-list.json";
const request = new Request(url, { cache: "no-cache" });
function PopulateCombos(targetDiv, targetComboType)
{
  const comboArea = targetDiv;
  fetch(request).then((response)=>response.json()).then((data)=> {
    for (let combo of data[targetComboType])
    {
      const newDiv = document.createElement("div");
      newDiv.setAttribute("id", combo["name"]);
      newDiv.innerHTML = comboAreaTemplate;
      comboArea.appendChild(newDiv);

      // title
      newDiv.getElementsByClassName("combo-text-title")[0].innerHTML = combo["name"];

      // start
      const insertionArea = newDiv.getElementsByClassName("combo-insertion-area")[0];
      const start = combo["start"].split(',');
      for (let i = 0; i < start.length; i++)
      {
        const startParts = start[i].split('|');

        const newVisual = document.createElement("div");
        newVisual.setAttribute("class", "combo-container");
        newVisual.innerHTML = comboVisualAreaTemplate;
        insertionArea.appendChild(newVisual);

        const shell = newVisual.getElementsByClassName("image-shell")[0];
        const bigImage = comboImageTemplate.replace("Z", startParts[0]);
        shell.innerHTML = bigImage;

        const miniImageShell = shell.getElementsByClassName("combo-area-sub")[0];
        for (let j = 1; j < startParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "combo-image-sub " + startParts[j]);
          miniImageShell.appendChild(miniImage);
        }
      }

      // arrow
      const newArrow = document.createElement("span");
      newArrow.setAttribute("class", "combo-arrow");
      insertionArea.appendChild(newArrow);
      newArrow.innerHTML = "►";

      // end
      const end = combo["end"].split(',');
      for (let i = 0; i < end.length; i++)
      {
        const endParts = end[i].split('|');

        const newVisual = document.createElement("div");
        newVisual.setAttribute("class", "combo-container");
        newVisual.innerHTML = comboVisualAreaTemplate;
        insertionArea.appendChild(newVisual);

        const shell = newVisual.getElementsByClassName("image-shell")[0];
        const bigImage = comboImageTemplate.replace("Z", endParts[0]);
        shell.innerHTML = bigImage;

        const miniImageShell = shell.getElementsByClassName("combo-area-sub")[0];
        for (let j = 1; j < endParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "combo-image-sub " + endParts[j]);
          miniImageShell.appendChild(miniImage);
        }
      }

      // bonuses
      const newVisual = document.createElement("div");
      newVisual.setAttribute("class", "combo-container");
      newVisual.innerHTML = comboVisualAreaTemplate;
      insertionArea.appendChild(newVisual);

      const shell = newVisual.getElementsByClassName("image-shell")[0];

      const halfImage = document.createElement("img");
      halfImage.setAttribute("class", "combo-image-half hundred");
      shell.appendChild(halfImage);

      if (combo["banishes"] > 0)
      {
        const halfSpan = document.createElement("span");
        halfSpan.setAttribute("class", "combo-text-hundred");
        halfSpan.innerHTML = "x" + String(combo["banishes"]);
        shell.appendChild(halfSpan);
      }

      if (combo["cipher"])
      {
        const xSpan = document.createElement("span");
        xSpan.setAttribute("class", "combo-text-x");
        xSpan.innerHTML = "+EX";
        shell.appendChild(xSpan);
      }

      // path
      var finalPath = "";
      const path = combo["path"].split('.');
      for (let i = 0; i < path.length - 1; i++)
      {
        finalPath += String(i + 1) + ". " + path[i] + ".";
        if (i != path.length - 1)
        {
          finalPath += "<br>"
        }
      }
      newDiv.getElementsByClassName("combo-description-content")[0].innerHTML = "<p>" + finalPath + "</p>";
      const button = newDiv.getElementsByClassName("collapsible")[0];
      button.addEventListener("click", function() {

        console.log("hi");
        var content = this.nextElementSibling;
        if (content.style.display === "block")
        {
          content.style.display = "none";
        }
        else
        {
          content.style.display = "block";
        }

      });

    }
  }).catch(console.error);
}

// ------------------------------------------------------ //
function ButtonFunc(number)
{
  const num = String(number);

  for (const child of document.getElementById("button-area").children) {
    if (child.getAttribute("id").endsWith(num))
    {
      child.setAttribute("disabled", true);
    }
    else
    {
      child.removeAttribute("disabled");
    }
  }

  for (const child of document.getElementById("combo-area").children) {
    if (child.getAttribute("id").endsWith(num))
    {
      child.removeAttribute("hidden");
    }
    else
    {
      child.setAttribute("hidden", true);
    }
  }

}

// ------------------------------------------------------ //
function Initialize()
{
  ButtonFunc(3);
  PopulateCombos(document.getElementById("card-combos-1"), "1-card-combos");
  PopulateCombos(document.getElementById("card-combos-2"), "1.5-card-combos");
  PopulateCombos(document.getElementById("card-combos-3"), "2-card-combos");
}