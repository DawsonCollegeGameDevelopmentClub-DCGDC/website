'use strict';
import { setupSearch } from './searchEngine.js';

const formatDate = (date) => new Intl.DateTimeFormat('en-CA', {
	dateStyle: 'medium'
}).format(new Date(`${date}T12:00:00`));

const PROJECTS_PER_PAGE = 10;

function renderStudentWorks(works, shouldSetupSearch = true, requestedPage = 1) {
	const list = document.getElementById('student-works-list');
	const count = document.getElementById('works-count');
	const pagination = document.getElementById('works-pagination');
	if (!list || !count || !pagination) return;
	const sortedWorks = [...works].sort((firstWork, secondWork) => (
		new Date(`${secondWork.submitted}T12:00:00`) - new Date(`${firstWork.submitted}T12:00:00`)
	));
	const pageCount = Math.ceil(sortedWorks.length / PROJECTS_PER_PAGE);
	const currentPage = Math.min(Math.max(Number.parseInt(requestedPage, 10) || 1, 1), pageCount || 1);
	const pageStart = (currentPage - 1) * PROJECTS_PER_PAGE;
	const pageWorks = sortedWorks.slice(pageStart, pageStart + PROJECTS_PER_PAGE);

	let projectSuffix = 's';
	if (sortedWorks.length === 1) {
		projectSuffix = '';
	}
	count.textContent = `${sortedWorks.length} project${projectSuffix}`;
	if (!sortedWorks.length) {
		list.innerHTML = '<p class="works-empty">No projects have landed yet. Check back soon.</p>';
		pagination.hidden = true;
		return;
	}

	list.innerHTML = pageWorks.map((work, index) => {
		const projectNumber = pageStart + index;
		let images = ['../assets/DawsonGDC.jpg'];
		if (work.images?.length) {
			images = work.images;
		}
		const imageSlides = images.map((image, imageIndex) => {
			let activeClass = '';
			if (imageIndex === 0) {
				activeClass = ' is-active';
			}
			let imagePath = image;
			if (work.images?.length) {
				imagePath = `../assets/gameImages/build${work.id}/${image}`;
			}
			return `
				<img class="work-gallery__image${activeClass}" src="${imagePath}" alt="${work.name} preview ${imageIndex + 1}" data-slide="${imageIndex}" loading="lazy" />
			`;
		}).join('');
		const dots = images.map((_, imageIndex) => {
			let activeClass = '';
			if (imageIndex === 0) {
				activeClass = ' is-active';
			}
			return `
				<button class="work-gallery__dot${activeClass}" type="button" aria-label="Show image ${imageIndex + 1} of ${images.length}" aria-pressed="${imageIndex === 0}" data-slide-to="${imageIndex}"></button>
			`;
		}).join('');
		let galleryControls = '';
		if (images.length > 1) {
			galleryControls = '<button class="work-gallery__arrow work-gallery__arrow--previous" type="button" aria-label="Previous image">&lt;</button><button class="work-gallery__arrow work-gallery__arrow--next" type="button" aria-label="Next image">&gt;</button><div class="work-gallery__dots">' + dots + '</div>';
		}
		let link = '<span class="work-card__unlinked">No showcase link yet</span>';
		if (work.link) {
			link = `<a class="button button--dark" href="${work.link}" target="_blank" rel="noopener noreferrer">View project <span aria-hidden="true">-&gt;</span></a>`;
		}

		return `
			<article class="work-card" data-work-index="${index}">
				<div class="work-gallery" aria-label="${work.name} image gallery">
					<div class="work-gallery__track">${imageSlides}</div>
					${galleryControls}
					<span class="work-gallery__label">BUILD ${String(projectNumber + 1).padStart(2, '0')}</span>
				</div>
				<div class="work-card__details">
					<p class="mission-card__topline"><span>SUBMISSION ${String(projectNumber + 1).padStart(2, '0')}</span><span>${formatDate(work.submitted)}</span></p>
					<h3>${work.name}</h3>
					<p class="work-card__students">By ${work.students.join(' + ')}</p>
					<p>${work.synopsis}</p>
					<dl class="work-card__dates"><div><dt>Started</dt><dd>${formatDate(work.started)}</dd></div><div><dt>Submitted</dt><dd>${formatDate(work.submitted)}</dd></div></dl>
					<div class="work-card__action">${link}</div>
				</div>
			</article>
		`;
	}).join('');

	list.querySelectorAll('.work-card').forEach((card) => setupGallery(card));
	renderPagination(pagination, currentPage, pageCount, (nextPage) => renderStudentWorks(sortedWorks, false, nextPage));
	if (shouldSetupSearch) {
		setupSearch(sortedWorks, (matchingWorks) => renderStudentWorks(matchingWorks, false, 1));
	}
}

function renderPagination(pagination, currentPage, pageCount, onPageChange) {
	if (pageCount <= 1) {
		pagination.hidden = true;
		pagination.innerHTML = '';
		return;
	}

	pagination.hidden = false;
	const pageButtons = Array.from({ length: Math.min(pageCount, 5) }, (_, index) => {
		const page = index + 1;
		let current = '';
		if (page === currentPage) {
			current = ' aria-current="page"';
		}
		return `<button class="works-pagination__page" type="button" data-page="${page}"${current}>${page}</button>`;
	}).join('');
	let previousDisabled = '';
	if (currentPage === 1) {
		previousDisabled = ' disabled';
	}
	let nextDisabled = '';
	if (currentPage === pageCount) {
		nextDisabled = ' disabled';
	}
	pagination.innerHTML = `
		<button class="works-pagination__arrow" type="button" data-page="${currentPage - 1}" aria-label="Previous page"${previousDisabled}>&lt;</button>
		<div class="works-pagination__pages">${pageButtons}</div>
		<button class="works-pagination__arrow" type="button" data-page="${currentPage + 1}" aria-label="Next page"${nextDisabled}>&gt;</button>
		<span class="works-pagination__status">Page ${currentPage} of ${pageCount}</span>
		<label class="works-pagination__jump">Go to <input type="number" min="1" max="${pageCount}" step="1" inputmode="numeric" aria-label="Go to page" /></label>
	`;

	pagination.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => {
		if (!button.disabled) onPageChange(button.dataset.page);
	}));
	const input = pagination.querySelector('input');
	const goToInputPage = () => {
		const page = Number.parseInt(input.value, 10);
		if (page >= 1 && page <= pageCount) {
			onPageChange(page);
			return;
		}
		input.setAttribute('aria-invalid', 'true');
	};
	input.addEventListener('change', goToInputPage);
	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') goToInputPage();
	});
}

function setupGallery(card) {
	const images = [...card.querySelectorAll('.work-gallery__image')];
	const dots = [...card.querySelectorAll('.work-gallery__dot')];
	let activeSlide = 0;

	const showSlide = (nextSlide) => {
		activeSlide = (nextSlide + images.length) % images.length;
		images.forEach((image, index) => image.classList.toggle('is-active', index === activeSlide));
		dots.forEach((dot, index) => {
			dot.classList.toggle('is-active', index === activeSlide);
			dot.setAttribute('aria-pressed', String(index === activeSlide));
		});
	};

	card.querySelector('.work-gallery__arrow--previous')?.addEventListener('click', () => showSlide(activeSlide - 1));
	card.querySelector('.work-gallery__arrow--next')?.addEventListener('click', () => showSlide(activeSlide + 1));
	dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
}

async function loadStudentWorks() {
	try {
		const response = await fetch('../assets/information/studentWorks.json');
		if (!response.ok) {
			throw new Error(`Could not load student works: ${response.status}`);
		}
		const studentWorks = await response.json();
		renderStudentWorks(studentWorks);
	} catch (error) {
		const list = document.getElementById('student-works-list');
		if (list) {
            const child = document.createElement('p');
            child.classList.add('works-empty');
            child.textContent = 'Student works could not be loaded right now.';
            list.appendChild(child);
		}
		console.error(error);
	}
}

loadStudentWorks();