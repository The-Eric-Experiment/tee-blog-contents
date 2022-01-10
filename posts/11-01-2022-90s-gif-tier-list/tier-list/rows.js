const rows = document.querySelectorAll(".row");
const colors = [
  "#F27A7A",
  "#FEC07F",
  "#FEFF80",
  "#80FF80",
  "#80C0FF",
  "#8080FF",
  "#F379F3",
];

const onDragOver = (event) => {
  event.preventDefault();
};

const onDrop = (event) => {
  event.preventDefault();
  const draggedCardId = event.dataTransfer.getData("id");
  const draggedCard = document.getElementById(draggedCardId);
  event.target.appendChild(draggedCard);
  console.log("dropped the element");
};

rows.forEach((row, index) => {
  const label = row.querySelector(".label");
  label.style.backgroundColor = colors[index];
  row.ondragover = onDragOver;
  row.ondrop = onDrop;
});
