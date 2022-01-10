const cards = document.querySelectorAll(".card");
let ids = 0;

/* Card Logic */
const createCard = (idx) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("draggable", "true");
  card.id = ++ids + "_card";
  card.ondragstart = onDragStart;
  card.ondragend = onDragEnd;

  const image = new Image();

  image.src = "imgs/" + idx + ".gif";
  image.style.pointerEvents = "none";
  card.appendChild(image);

  return card;
};

function appendStuff() {
  for (let i = 1; i <= 28; i++) {
    const card = createCard(i);
    const bank = document.querySelector("#bank");
    bank.appendChild(card);
  }
}

const onDragStart = (event) => {
  console.log("dragging the element");
  event.dataTransfer.setData("id", event.target.id);
  setTimeout(() => {
    event.target.style.visibility = "hidden";
  }, 50);
};

const onDragEnd = (event) => {
  event.target.style.visibility = "visible";
  console.log("ended the drag");
};

cards.forEach((card) => {
  card.ondragstart = onDragStart;
  card.ondragend = onDragEnd;
});

appendStuff();
