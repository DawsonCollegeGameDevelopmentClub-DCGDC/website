'use strict';

const studentWorks = [
	{
		name: 'Chiikawa platformer',
		students: ['Aris John Apolinario', 'Kelly Yu'],
		submitted: '2025-11-05',
		started: '2025-10-11',
		synopsis: 'A random platformer game based on the Chiikawa anime, where you play as a cute character navigating through various levels and obstacles.',
		link: 'https://sonic.dawsoncollege.qc.ca/~2532450/Chiikawa-main/Chiikawa/pages/Game.html',
		images: [ '../assets/DawsonGDC.jpg' ]
	},  

];

const formatDate = (date) => new Intl.DateTimeFormat('en-CA', {
	dateStyle: 'medium'
}).format(new Date(`${date}T12:00:00`));

function renderStudentWorks(works) {
	const list = document.getElementById('student-works-list');
	const count = document.getElementById('works-count');
	if (!list || !count) return;
	const sortedWorks = [...works].sort((firstWork, secondWork) => (
		new Date(`${secondWork.submitted}T12:00:00`) - new Date(`${firstWork.submitted}T12:00:00`)
	));

	count.textContent = `${sortedWorks.length} project${sortedWorks.length === 1 ? '' : 's'}`;
	if (!sortedWorks.length) {
		list.innerHTML = '<p class="works-empty">No projects have landed yet. Check back soon.</p>';
		return;
	}

	list.innerHTML = sortedWorks.map((work, index) => {
		const images = work.images?.length ? work.images : ['../assets/DawsonGDC.jpg'];
		const imageSlides = images.map((image, imageIndex) => `
			<img class="work-gallery__image${imageIndex === 0 ? ' is-active' : ''}" src="${image}" alt="${work.name} preview ${imageIndex + 1}" data-slide="${imageIndex}" loading="lazy" />
		`).join('');
		const dots = images.map((_, imageIndex) => `
			<button class="work-gallery__dot${imageIndex === 0 ? ' is-active' : ''}" type="button" aria-label="Show image ${imageIndex + 1} of ${images.length}" aria-pressed="${imageIndex === 0}" data-slide-to="${imageIndex}"></button>
		`).join('');
		const link = work.link ? `<a class="button button--dark" href="${work.link}" target="_blank" rel="noopener noreferrer">View project <span aria-hidden="true">-&gt;</span></a>` : '<span class="work-card__unlinked">No showcase link yet</span>';

		return `
			<article class="work-card" data-work-index="${index}">
				<div class="work-gallery" aria-label="${work.name} image gallery">
					<div class="work-gallery__track">${imageSlides}</div>
					${images.length > 1 ? `<button class="work-gallery__arrow work-gallery__arrow--previous" type="button" aria-label="Previous image">&lt;</button><button class="work-gallery__arrow work-gallery__arrow--next" type="button" aria-label="Next image">&gt;</button><div class="work-gallery__dots">${dots}</div>` : ''}
					<span class="work-gallery__label">BUILD ${String(index + 1).padStart(2, '0')}</span>
				</div>
				<div class="work-card__details">
					<p class="mission-card__topline"><span>SUBMISSION ${String(index + 1).padStart(2, '0')}</span><span>${formatDate(work.submitted)}</span></p>
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

renderStudentWorks(studentWorks);