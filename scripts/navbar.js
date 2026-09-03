"use strict";
async function getNav() {
  const response = await fetch("/pages/navbar.html");
  const navbarHTML = await response.text();
  const navbar = document.querySelector(".navbar");
  navbar.innerHTML = navbarHTML;

}

getNav();
