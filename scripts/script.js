"use strict";


async function appendNav() {
  const response = await fetch("/pages/navbar.html");
  const navbarHTML = await response.text();
  const navbar = document.querySelector(".navbar");
  navbar.innerHTML = navbarHTML;

}

async function appendFooter() {
  const response = await fetch("/pages/footer.html");
  const footerHTML = await response.text();
  const footer = document.querySelector(".site-footer");
  footer.innerHTML = footerHTML;
}

async function setupNavbarAndTheme() {
  await appendNav();
  await appendFooter();
  setupThemeToggle();
  setupMobileNavbar();
}

async function setupThemeToggle() {
  // --- Theme Toggling Logic ---
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      // Check current theme
      const currentTheme = htmlElement.getAttribute('data-theme');
      // Determine the new theme
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Set the new theme
      htmlElement.setAttribute('data-theme', newTheme);
      // Save the new theme to localStorage
      localStorage.setItem('theme', newTheme);
    });
  }

}

async function setupMobileNavbar() {
  // --- Mobile Menu Toggle ---
  const navbarToggle = document.getElementById('navbarToggle');
  console.log(navbarToggle);
  const navbarMenu = document.getElementById('navbarMenu');
  if (navbarToggle) {
    navbarToggle.addEventListener('click', function() {
      navbarToggle.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    });
  }

}

// Dont touch below this line unless you know what you're doing --- Magic stuff
function setupMissionButton() {
  const missionButton = document.getElementById('mission-button');
  const missionFeedback = document.getElementById('mission-feedback');
  const discordInvite = 'https://discord.gg/XwTqyADs2Z';

  if (missionButton && missionFeedback) {
    missionButton.addEventListener('click', function() {
      window.open(discordInvite, '_blank', 'noopener,noreferrer');
      missionButton.textContent = 'Quest accepted +';
      missionButton.disabled = true;
      missionFeedback.textContent = 'Nice. Your next co-op starts here.';
    });
  }
}

setupNavbarAndTheme();
setupMissionButton();
