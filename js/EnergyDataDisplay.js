export class EnergyDataDisplay {
    #searchInput
    #searchForm
    #consumptionContainer
    #productionContainer
    #searchTable
    #currentPage
    #totalPages
    #pagination
    #searchSortControls
    #sortField
    #sortOrder
    #sortBtn
    #searchQuery 

    constructor () {
        this.#searchInput = document.getElementById('search-box')
        this.#searchForm = document.getElementById('searchForm')
        this.#consumptionContainer = document.getElementById('consumption-container')
        this.#productionContainer = document.getElementById('production-container')
        this.#searchTable = document.getElementById('search-tabel')
        this.#currentPage = 1
        this.#totalPages = 1
        this.#pagination = document.getElementById('pagination-controls')
        this.#searchSortControls = document.getElementById('search-sort-controls')
        this.#sortField = document.getElementById('sortField')
        this.#sortOrder = document.getElementById('sortOrder')
        this.#sortBtn = document.getElementById('sortBtn')  
        this.#searchQuery = ''


   
        this.#searchForm.addEventListener('submit', (event) => this.#fetchEnergyData(event))
        this.#sortBtn.addEventListener('click', () => this.#sortData())
    }

    async #fetchEnergyData(event) {
        // Prevent default form submission behavior only when there is an event
        if (event) event.preventDefault();

        this.#consumptionContainer.classList.add('hidden')
        this.#productionContainer.classList.add('hidden')
        this.#searchSortControls.classList.remove('hidden')

        // Update search query if triggered by form submit
        if (event) {
            this.#searchQuery = this.#searchInput.value
            this.#searchInput.value = ''  
        }

        // API URL and payload
        const url = `https://cscloud7-30.lnu.se/wt2/api/search?page=${this.#currentPage}&limit=25`
        const searchQuery = {
            query: this.#searchQuery 
        }

        // Fetch data from API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        })
        const data = await response.json()

        console.log('API Response:', data)

        const { searchResults, currentPage, totalPages } = data

        const noDataMessage = document.getElementById('no-data-message');
        if (noDataMessage) {
        noDataMessage.remove();
        }

        // Handle no results case
        if (searchResults.length === 0) {
            const noDataMessage = document.createElement('p')
            noDataMessage.textContent = 'No results found for the given country. Available countries are: France, China, India, Japan, Australia, Russia, Brazil, Germany, USA, Canada'
            noDataMessage.id = 'no-data-message'
            noDataMessage.style.color = 'red'
            this.#searchTable.parentNode.insertBefore(noDataMessage, this.#searchTable)
            this.#searchTable.classList.add('hidden')
        }

        // Update current page and total pages
        this.#currentPage = currentPage
        this.#totalPages = totalPages

        // Render data and pagination controls
        this.#renderEnergyData(searchResults)
        this.#renderPagingsbuttons()
    }

    #renderEnergyData(data) {
        const tbody = this.#searchTable.querySelector('tbody')
        tbody.textContent = '' // Clear previous results

        // Render each result as a row in the table
        data.forEach(item => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${item.country || 'N/A'}</td>
                <td>${item.year || 'N/A'}</td>
                <td>${item.production || 'N/A'} GWh</td>
                <td>${item.consumption || 'N/A'} GWh</td>
                <td>${item.gdp || 'N/A'} USD</td>
                <td>${item.electricityExports || 'N/A'} GWh</td>
                <td>${item.electricityImports || 'N/A'} GWh</td>
                <td>${item.co2Emissions || 'N/A'} Mt</td>
            `
            tbody.appendChild(row)
        })

        // Show the search table once data is rendered
        this.#searchTable.classList.remove('hidden')
    }

    #renderPagingsbuttons() {
        const nextButton = document.createElement('button')
        const previousButton = document.createElement('button')
        this.#pagination.innerHTML = '' // Clear previous buttons

        nextButton.textContent = 'Next page'
        previousButton.textContent = 'Previous Page'

        // Handle "Previous" button
        previousButton.disabled = this.#currentPage === 1
        previousButton.addEventListener('click', () => {
            if (this.#currentPage > 1) {
                this.#currentPage -= 1
                this.#fetchEnergyData(null) // Passing null since no event is needed
            }
        })

        // Handle "Next" button
        nextButton.disabled = this.#currentPage === this.#totalPages
        nextButton.addEventListener('click', () => {
            if (this.#currentPage < this.#totalPages) {
                this.#currentPage += 1
                this.#fetchEnergyData(null) // Passing null since no event is needed
            }
        })

        // Append buttons to pagination container
        this.#pagination.appendChild(previousButton)
        this.#pagination.appendChild(nextButton)
    }

    async #sortData() {
        const url = `https://cscloud7-30.lnu.se/wt2/api/search?page=${this.#currentPage}&limit=25&sortField=${this.#sortField.value}&sortOrder=${this.#sortOrder.value}`
        const searchQuery = {
            query: this.#searchQuery
        }

        // Fetch sorted data from API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        })

        const data = await response.json()
        const { searchResults, currentPage, totalPages } = data

        // Update current page and total pages after sorting
        this.#currentPage = currentPage
        this.#totalPages = totalPages

        // Render sorted data and update pagination
        this.#renderEnergyData(searchResults)
        this.#renderPagingsbuttons()
    }
}
