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
	const image = work.images?.[0] ? `../assets/gameImages/build${work.id}/${work.images[0]}` : null;
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

function getRankedMatches(works, regex, query) {
	return works.map((work) => {
		const studentScore = getMatchScore(work.students.join(' '), regex, query);
		const projectScore = getMatchScore(work.name, regex, query);
		let score = studentScore;
		if (projectScore !== null && (score === null || projectScore < score)) {
			score = projectScore;
		}
		return { work, score };
	}).filter((result) => result.score !== null).sort((first, second) => first.score - second.score);
}

function renderSearchResults(results, studentMatches, projectMatches) {
	if (!studentMatches.length && !projectMatches.length) {
		results.innerHTML = '<p class="search-results__message">No results.</p>';
		return;
	}
	results.innerHTML = `${renderSearchCategory('Students', studentMatches)}${renderSearchCategory('Projects', projectMatches)}`;
}

function setupSearch(works, onSearch) {
	const input = document.getElementById('works-search-input');
	const results = document.getElementById('works-search-results');
	const searchButton = document.getElementById('works-search-button');
	if (!input || !results) return;

	function updateDropdown() {
		const query = input.value.trim();
		results.classList.toggle('is-visible', Boolean(query));
		if (!query) {
			results.innerHTML = '';
			input.removeAttribute('aria-invalid');
			return false;
		}

		let regex;
		try {
			regex = new RegExp(query, 'i');
			input.removeAttribute('aria-invalid');
		} catch {
			input.setAttribute('aria-invalid', 'true');
			results.innerHTML = '<p class="search-results__message">Invalid regex pattern.</p>';
			return false;
		}

		const studentMatches = works.map((work) => ({
			work,
			score: getMatchScore(work.students.join(' '), regex, query)
		})).filter((result) => result.score !== null).sort((first, second) => first.score - second.score).slice(0, 3);
		const projectMatches = works.map((work) => ({
			work,
			score: getMatchScore(work.name, regex, query)
		})).filter((result) => result.score !== null).sort((first, second) => first.score - second.score).slice(0, 3);

		renderSearchResults(results, studentMatches, projectMatches);

		results.querySelectorAll('.search-result').forEach((result) => result.addEventListener('click', () => {
			input.value = result.dataset.projectName;
			search();
			results.classList.remove('is-visible');
		}));
		return true;
	}

	function search() {
		const query = input.value.trim();
		if (!query) {
			updateDropdown();
			onSearch(works);
			return;
		}
		if (!updateDropdown()) return;
		const regex = new RegExp(query, 'i');
		const rankedMatches = getRankedMatches(works, regex, query).map((result) => result.work);
		onSearch(rankedMatches);
		results.classList.remove('is-visible');
	}

	input.addEventListener('input', updateDropdown);
	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			search();
		}
	});
	searchButton?.addEventListener('click', search);
}

export { setupSearch };