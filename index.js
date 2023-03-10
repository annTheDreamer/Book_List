'use strict';

let jsonData;
let toggleViewAsTable = false; //default view is Grid
let filteredBooks = [];

//Selecting elements for visual manipulation and adding event listeners
const bookInfo = document.querySelector('.book-list-container');
const searchButton = document.querySelector('.header-container__search-button');
const showAllButton = document.querySelector(
	'.header-container__show-all-button'
);
const description = document.querySelector('.header-container__description');
const inputField = document.querySelector('.header-container__input-field');
const tableViewBtn = document.querySelector(
	'.header-container__table-view-button'
);

//Getting data from the JSON file
fetch('listofbooks.json')
	.then((response) => response.json())
	.then((data) => {
		createSortedList(data); //displaying data from the JSON file, sorted alphabetically by Author's name
		jsonData = data; //making a copy of JSON array which can be used independently of the fetch function
	})
	.catch((error) => {
		console.log(error);
	});

//Displaying JSON data in HTML
const displayData = function (data) {
	//Setting up the CSS properties for the default Grid view
	bookInfo.style.display = 'grid';
	description.style.color = '#b9dbd9';
	document.body.style.overflowY = 'scroll';
	document.body.style.backgroundImage = "url('./images/circle-scatter.png')";
	tableViewBtn.style.display = 'inline-block';
	//Creating new HTML elements which display the provided info about all the books from the provided data, and adding classes accordingly
	for (let i = 0; i < data.length; i++) {
		let section = document.createElement('section'); //each section contains 3 div elements: the name of the author, the title of the book, and the genre
		section.classList.add(
			'book-list-container__book-info',
			'book-list-container__selector'
		);
		let author = document.createElement('div');
		author.classList.add('book-list-container__author');
		author.textContent = data[i]['author'];
		let title = document.createElement('div');
		title.classList.add('book-list-container__title');
		title.textContent = data[i]['title'];
		let genre = document.createElement('div');
		genre.classList.add('book-list-container__genre');
		genre.textContent = data[i]['genre'];
		//Nesting all 3 elements into the section element
		section.appendChild(author);
		section.appendChild(title);
		section.appendChild(genre);
		//Nesting the section element in the book-list container
		bookInfo.appendChild(section);
	}
	bookInfo.style.background = 'none'; //removing the background
};

//Creating an alphabetically sorted list
const createSortedList = function (data) {
	//Sorting the provided data alphabetically
	data = data.sort((a, b) => {
		if (a.author < b.author) return -1;
	});
	//Displaying the sorted data
	displayData(data);
};

//Removing children from HTML blocks
const removeSections = function (parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};

//Showing a message in case there are no results found, or search value is empty
const showMessage = function (message, url) {
	//Creating elements and adding classes that will show the appropriate message and image
	let info = document.createElement('div');
	info.classList.add('book-list-container__no-results');
	let msg = document.createElement('p');
	msg.classList.add('book-list-container__explanation');
	let pic = document.createElement('img');
	pic.classList.add('book-list-container__picture');
	pic.src = url;
	msg.textContent = message;
	//Nesting the message and picture into the container
	info.appendChild(msg);
	info.appendChild(pic);
	bookInfo.appendChild(info);
	//Manipulating CSS properties
	tableViewBtn.style.display = 'none'; //hiding the View as Table/Grid button
	document.body.style.backgroundImage = 'none';
	document.body.style.backgroundColor = 'white';
	document.body.style.overflow = 'hidden';
	description.style.color = '#2e3344';
	bookInfo.style.display = 'flex';
};

//Creating the table header needed for Table View
const createTableHeader = function () {
	//Creating HTML elements for the table header, and adding the appropriate classes
	bookInfo.classList.add('book-list-container__list');
	//Creating the elements from the table header
	let tableHeader = document.createElement('section');
	tableHeader.classList.add('book-list-container__row');
	const headerAuthor = document.createElement('p');
	headerAuthor.textContent = 'Author';
	headerAuthor.classList.add('book-list-container__header-author');
	const headerTitle = document.createElement('p');
	headerTitle.textContent = 'Title';
	const headerGenre = document.createElement('p');
	headerGenre.textContent = 'Genre';
	//Nesting the header elements into the table header
	tableHeader.appendChild(headerAuthor);
	tableHeader.appendChild(headerTitle);
	tableHeader.appendChild(headerGenre);
	tableHeader.classList.add('book-list-container__table-header');
	//Inserting the table header before the first displayed element from the JSON data
	bookInfo.insertBefore(tableHeader, bookInfo.firstChild);
};

//Creating the content of the table
const createTableContent = function () {
	//Manipulating CSS properties
	document.body.style.backgroundImage = 'none';
	document.body.style.backgroundColor = '#2e3344';
	//Selecting all the section elements which contain book info
	const listInfo = document.querySelectorAll(
		'.book-list-container__selector'
	);
	for (let i = 0; i < listInfo.length; i++) {
		//Adding list display and removing grid display
		listInfo[i].classList.add('book-list-container__row');
		listInfo[i].classList.remove('book-list-container__book-info');
		//Highlighting rows in different colors
		listInfo[i].style.color = '#b9dbd9';
		if (i % 2 === 0) listInfo[i].style.backgroundColor = '#ffffff10';
	}
};

//Removing the table needed for the "View as Table/Grid" toggle button
const deleteTable = function () {
	bookInfo.classList.remove('book-list-container__list');
	//Removing the table header
	document.querySelector('.book-list-container__table-header').remove();
	//Selecting all rows and deleting them
	const rows = document.querySelectorAll('.book-list-container__row');
	for (let i = 0; i < rows.length; i++) {
		rows[i].remove();
	}
};

//Adding search functionality
searchButton.addEventListener('click', function (e) {
	e.preventDefault(); //preventing a refresh of the page
	removeSections(bookInfo); //removing previosly created elements
	const input = inputField.value.toLowerCase(); //making the input value case insensitive
	//Checking whether input is empty
	if (!input || input === ' ') {
		//Displaying corresponding message and picture
		showMessage(
			'Please enter a search keyword!',
			'./images/enter_keyword.png'
		);
		//Changing CSS property if viewing a table
		if (toggleViewAsTable)
			document.querySelector(
				'.book-list-container__list'
			).style.backgroundColor = 'white';
		return false; //exiting the search event listener
	}
	//Filter function that allows filtering by author, title, or genre
	const filtered = function (book) {
		return (
			book.author.toLowerCase().includes(input) ||
			book.title.toLowerCase().includes(input) ||
			book.genre.toLowerCase().includes(input)
		);
	};

	//Filtering the JSON array with the filtered function
	filteredBooks = jsonData.filter(filtered);

	//Checking whether the filter returned any data
	if (filteredBooks.length === 0) {
		//Displaying corresponding message and picture
		showMessage('No results found!', './images/not_found.png');
		//Changing CSS property if viewing a table
		if (toggleViewAsTable)
			document.querySelector(
				'.book-list-container__list'
			).style.backgroundColor = 'white';
		return false; //exiting the search event listener
	}

	displayData(filteredBooks); //displaying filtered data

	//Creating table view if the toggle button for creating a table view is clicked
	if (toggleViewAsTable) {
		createTableHeader();
		createTableContent();
	}
});

showAllButton.addEventListener('click', function (e) {
	e.preventDefault(); //preventing a refresh of the page
	filteredBooks = jsonData; //resetting the book filter
	removeSections(bookInfo); //removing previosly created elements
	displayData(jsonData); //displaying all the books info

	//Creating table view if the toggle button for creating a table view is clicked
	if (toggleViewAsTable) {
		createTableHeader();
		createTableContent();
	}

	inputField.value = ''; //resetting the search value
});

tableViewBtn.addEventListener('click', function () {
	//Adding toggle functionality
	toggleViewAsTable = !toggleViewAsTable;

	//Creating table view if the toggle button for creating a table view is clicked and changing the name of the button
	if (toggleViewAsTable) {
		createTableHeader();
		createTableContent();
		tableViewBtn.textContent = 'View as Grid';
	} else {
		//Removing table view and changing the name of the button
		deleteTable();
		tableViewBtn.textContent = 'View as Table';

		//Displaying filtered books if there are any; displaying all of them if there aren't
		if (filteredBooks.length === 0) displayData(jsonData);
		else displayData(filteredBooks);
	}
});
