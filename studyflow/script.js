function scrollToAbout() {
  document.getElementById("about").scrollIntoView({
    behavior: "smooth"
  });
}

let count = 0;

function increaseCount() {
  count++;
  document.getElementById("count").innerText = count;
}

function resetCount() {
  count = 0;
  document.getElementById("count").innerText = count;
}