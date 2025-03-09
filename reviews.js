document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');

    // Load existing reviews from localStorage
    let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');

    // Display existing reviews
    function displayReviews() {
        // Sort reviews by date, newest first
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Clear the reviews list except for the sample reviews
        const sampleReviews = Array.from(reviewsList.children);
        reviewsList.innerHTML = '';
        sampleReviews.forEach(review => reviewsList.appendChild(review));

        // Add stored reviews
        reviews.forEach(review => {
            const reviewCard = createReviewCard(review);
            reviewsList.insertBefore(reviewCard, reviewsList.firstChild);
        });
    }

    // Create a review card element
    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const header = document.createElement('div');
        header.className = 'review-header';
        
        const name = document.createElement('h3');
        name.textContent = review.name;
        
        const stars = document.createElement('div');
        stars.className = 'stars';
        stars.textContent = '★'.repeat(review.rating);
        
        const date = document.createElement('span');
        date.className = 'review-date';
        date.textContent = new Date(review.date).toLocaleDateString();
        
        const content = document.createElement('p');
        content.textContent = review.review;
        
        header.appendChild(name);
        header.appendChild(stars);
        header.appendChild(date);
        card.appendChild(header);
        card.appendChild(content);
        
        return card;
    }

    // Handle form submission
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const rating = document.querySelector('input[name="rating"]:checked').value;
        const review = document.getElementById('review').value;

        // Create new review object
        const newReview = {
            name: name,
            rating: parseInt(rating),
            review: review,
            date: new Date().toISOString()
        };

        // Add to reviews array
        reviews.push(newReview);

        // Save to localStorage
        localStorage.setItem('reviews', JSON.stringify(reviews));

        // Display updated reviews
        displayReviews();

        // Reset form
        reviewForm.reset();

        // Show success message
        alert('Thank you for your review!');
    });

    // Initial display of reviews
    displayReviews();
});
