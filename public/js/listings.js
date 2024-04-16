async function getListings(userid) {
  fetch(`/api/all-listings?id=${userid}`)
      .then(response => response.json())
      .then(listings => {
        const listingsDiv = document.querySelector('.listings');
        listings.forEach(listing => {
          let div = document.createElement('a');
          div.href = `/user/dashboard/listing?id=${listing._id}`; 
          div.className = "listing";
          div.classList.add("a-link")
          let image = listing.image.replace(/\\/g, '/');
          image = "/" + image;
          div.innerHTML = `
              <img src="${image}" alt="${listing.title}">
              <h3>${listing.title}</h3>
              <p class="category">${listing.category}</p>
              <p class="price">R${listing.price}</p>
              <div class="location-div">
              <svg id="location" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.90062 9.97586C5.82856 10.0273 5.74223 10.0549 5.65369 10.0549C5.56516 10.0549 5.47883 10.0273 5.40676 9.97586C3.27742 8.45811 1.01757 5.3362 3.30212 3.08031C3.92908 2.46304 4.77385 2.1174 5.65369 2.11817C6.53559 2.11817 7.38177 2.46431 8.00527 3.07987C10.2898 5.33576 8.02996 8.45723 5.90062 9.97586Z" stroke="black" stroke-width="0.661422" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5.65436 6.08655C5.88825 6.08655 6.11256 5.99363 6.27795 5.82824C6.44334 5.66286 6.53625 5.43854 6.53625 5.20465C6.53625 4.97076 6.44334 4.74644 6.27795 4.58106C6.11256 4.41567 5.88825 4.32275 5.65436 4.32275C5.42046 4.32275 5.19615 4.41567 5.03076 4.58106C4.86537 4.74644 4.77246 4.97076 4.77246 5.20465C4.77246 5.43854 4.86537 5.66286 5.03076 5.82824C5.19615 5.99363 5.42046 6.08655 5.65436 6.08655Z" stroke="black" stroke-width="0.661422" stroke-linecap="round" stroke-linejoin="round"/>
              </svg><p class="location">${listing.area}</p>`
          listingsDiv.appendChild(div);
        });
      })
      .catch(error => console.error('Error fetching listings:', error));
};

async function filterListings() {
  const category = document.getElementById('categoryFilter').value;
  const area = document.getElementById('areaFilter').value;
  const price = document.getElementById('priceFilter').value;

  fetch(`/filter?category=${category}&area=${area}&price=${price}`)
      .then(response => response.json())
      .then(listings => {
        const listingsDiv = document.querySelector('.listings');
        listingsDiv.innerHTML = ""; //clear previous listings

        listings.forEach(listing => {
          let div = document.createElement('a');
          div.href = `/listing?id=${listing._id}`; 
          div.className = "listing";
          div.classList.add("a-link")
          div.innerHTML = `
              <img src="${listing.image}" alt="${listing.title}">
              <h3>${listing.title}</h3>
              <p class="category">${listing.category}</p>
              <p class="price">R${listing.price}</p>
              <div class="location-div">
              <svg id="location" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.90062 9.97586C5.82856 10.0273 5.74223 10.0549 5.65369 10.0549C5.56516 10.0549 5.47883 10.0273 5.40676 9.97586C3.27742 8.45811 1.01757 5.3362 3.30212 3.08031C3.92908 2.46304 4.77385 2.1174 5.65369 2.11817C6.53559 2.11817 7.38177 2.46431 8.00527 3.07987C10.2898 5.33576 8.02996 8.45723 5.90062 9.97586Z" stroke="black" stroke-width="0.661422" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5.65436 6.08655C5.88825 6.08655 6.11256 5.99363 6.27795 5.82824C6.44334 5.66286 6.53625 5.43854 6.53625 5.20465C6.53625 4.97076 6.44334 4.74644 6.27795 4.58106C6.11256 4.41567 5.88825 4.32275 5.65436 4.32275C5.42046 4.32275 5.19615 4.41567 5.03076 4.58106C4.86537 4.74644 4.77246 4.97076 4.77246 5.20465C4.77246 5.43854 4.86537 5.66286 5.03076 5.82824C5.19615 5.99363 5.42046 6.08655 5.65436 6.08655Z" stroke="black" stroke-width="0.661422" stroke-linecap="round" stroke-linejoin="round"/>
              </svg><p class="location">${listing.area}</p>`
          listingsDiv.appendChild(div);
        });       
      })
      .catch(error => console.error('Error fetching listings:', error));
};

async function getListing(id) {
  try {
      const response = await fetch(`/api/listing?id=${id}`);
      if (!response.ok) {
          throw new Error('Failed to fetch listing');
      }
      const listing = await response.json();
      return listing;
  } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
  }
}


async function getUser(username) {
  fetch(`/api/userdetails?id=${username}`)
      .then(response => response.json())
      .then(user => {
        return user;
        })
        .catch(error => console.error('Error fetching user:', error)); 
      };
      
async function populateFilters() {
  try {
    const response = {};
    const areasPromise = fetch(`/api/areas`)
      .then(response => response.json());

    const categoriesPromise = fetch(`/api/categories`)
      .then(response => response.json());

    const [areas, categories] = await Promise.all([areasPromise, categoriesPromise]);

    response.areas = areas;
    response.categories = categories;

    return response;
  } catch (error) {
    console.error('Error fetching areas and categories:', error);
    return null;
  }
}


async function resetFilters() {
  document.getElementById('categoryFilter').selectedIndex = 0;
  document.getElementById('areaFilter').selectedIndex = 0;
  document.getElementById('priceFilter').selectedIndex = 0;
  await filterListings();
}

async function deleteListing(id) {
  await fetch(`/api/delete-listing?id=${id}`);
};
    



