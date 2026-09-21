"use strict";

const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	"'": '&#39;',
	'"': '&quot;'
})[character]);

const truncate = (value, maxLength = 34) => {
	if (value.length > maxLength) {
		return `${value.slice(0, maxLength - 1)}...`;
	}
	return value;
};

function getMatchScore(value, regex, query) {
	const match = value.match(regex);
	if (!match) return null;
	const normalizedValue = value.toLocaleLowerCase();
	const normalizedQuery = query.toLocaleLowerCase();
	if (normalizedValue === normalizedQuery) return 0;
	if (normalizedValue.startsWith(normalizedQuery)) return 1;
	return 2 + match.index;
}

function renderSearchResult({ work }) {
	const image = work.images?.[0];
	let imageHTML = '<span class="search-result__image search-result__image--empty" aria-hidden="true">--</span>';
	if (image) {
		imageHTML = `<img src="${escapeHTML(image)}" alt="" loading="lazy" />`;
	}
	return `<button class="search-result" type="button" role="option" data-project-name="${escapeHTML(work.name)}">${imageHTML}<span class="search-result__copy"><strong>${escapeHTML(truncate(work.name))}</strong><span>${escapeHTML(truncate(work.students.join(' + ')))}</span></span></button>`;
}

function renderSearchCategory(title, matches) {
	if (!matches.length) return '';
	return `<section class="search-results__category"><h3>${title}</h3>${matches.map(renderSearchResult).join('')}</section>`;
}

function setupSearch(works) {
	const input = document.getElementById('works-search-input');
	const results = document.getElementById('works-search-results');
	if (!input || !results) return;

	input.addEventListener('input', () => {
		const query = input.value.trim();
		results.classList.toggle('is-visible', Boolean(query));
		if (!query) {
			results.innerHTML = '';
			input.removeAttribute('aria-invalid');
			return;
		}

		let regex;
		try {
			regex = new RegExp(query, 'i');
			input.removeAttribute('aria-invalid');
		} catch {
			input.setAttribute('aria-invalid', 'true');
			results.innerHTML = '<p class="search-results__message">Invalid regex pattern.</p>';
			return;
		}

		const studentMatches = works.map((work) => ({
			work,
			score: getMatchScore(work.students.join(' '), regex, query)
		})).filter((result) => result.score !== null).sort((first, second) => first.score - second.score).slice(0, 3);
		const projectMatches = works.map((work) => ({
			work,
			score: getMatchScore(work.name, regex, query)
		})).filter((result) => result.score !== null).sort((first, second) => first.score - second.score).slice(0, 3);

		if (!studentMatches.length && !projectMatches.length) {
			results.innerHTML = '<p class="search-results__message">No results.</p>';
			return;
		}

		results.innerHTML = `${renderSearchCategory('Students', studentMatches)}${renderSearchCategory('Projects', projectMatches)}`;

		results.querySelectorAll('.search-result').forEach((result) => result.addEventListener('click', () => {
			const card = [...document.querySelectorAll('.work-card')].find((workCard) => workCard.querySelector('h3')?.textContent === result.dataset.projectName);
			card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			input.value = result.dataset.projectName;
			results.classList.remove('is-visible');
		}));
	});
}

export { setupSearch };