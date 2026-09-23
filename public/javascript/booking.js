const priceElement = document.getElementById("pricePerNight");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const nights = document.getElementById("nights");
const totalPrice = document.getElementById("totalPrice");

const pricePerNight = Number(priceElement.dataset.price);

function calculatePrice() {
  if (!checkIn.value || !checkOut.value) return;

  const start = new Date(checkIn.value);
  const end = new Date(checkOut.value);

  const difference = end - start;
  const numberOfNights = difference / (1000 * 60 * 60 * 24);

  if (numberOfNights <= 0) {
    nights.innerText = "0";
    totalPrice.innerText = "₹0";
    return;
  }

  nights.innerText = numberOfNights;
  totalPrice.innerText =
    "₹" + (numberOfNights * pricePerNight).toLocaleString("en-IN");
}

checkIn.addEventListener("change", calculatePrice);
checkOut.addEventListener("change", calculatePrice);