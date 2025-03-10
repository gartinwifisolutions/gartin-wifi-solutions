document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    const API_URL = 'https://gartin-wifi-api.onrender.com/api';
    const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

    // Fetch and display reviews
    async function fetchReviews() {
        reviewsList.innerHTML = '<div class="loading">Loading reviews</div>';
        
        try {
            console.log('Fetching reviews from:', `${API_URL}/reviews`);
            const response = await fetch(`${API_URL}/reviews`, {
                cache: 'no-store', // Always get fresh data
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
            }
            
            const reviews = await response.json();
            console.log('Received reviews:', reviews);
            
            // Filter out test reviews but keep real customer reviews
            const filteredReviews = reviews.filter(review => {
                const name = review.name.toLowerCase();
                const isTest = name.includes('test') || name.includes('quick');
                console.log(`Review from ${review.name}: ${isTest ? 'filtered out (test)' : 'included'}`);
                return review.approved && !isTest;
            });
            
            console.log('Filtered reviews:', filteredReviews);
            displayReviews(filteredReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewsList.innerHTML = `
                <div class="error-message">
                    Unable to load reviews. Please try refreshing the page.
                    <br>
                    Error: ${error.message}
                </div>
            `;
        }
    }

    // Display reviews
    function displayReviews(reviews) {
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            const noReviews = document.createElement('div');
            noReviews.className = 'no-reviews';
            noReviews.textContent = 'Be the first to leave a review!';
            reviewsList.appendChild(noReviews);
            return;
        }

        // Sort reviews by date (newest first)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Displaying reviews in order:', reviews.map(r => r.name));

        reviews.forEach(review => {
            const reviewCard = createReviewCard(review);
            reviewsList.appendChild(reviewCard);
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

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        reviewForm.insertAdjacentElement('beforebegin', errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        reviewForm.insertAdjacentElement('beforebegin', successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Handle form submission
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = reviewForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            // Get form values
            const name = document.getElementById('name').value;
            const rating = document.querySelector('input[name="rating"]:checked').value;
            const review = document.getElementById('review').value;

            console.log('Submitting review for:', name);

            // Create review object
            const newReview = {
                name: name.trim(),
                rating: parseInt(rating),
                review: review.trim()
            };

            // Submit review to backend
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify(newReview)
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            // Reset form
            reviewForm.reset();
            showSuccess('Thank you for your review! It is now visible on the page.');
            
            // Wait a moment before refreshing reviews to ensure the new review is available
            setTimeout(fetchReviews, 1000);
        } catch (error) {
            console.error('Error submitting review:', error);
            showError('Sorry, there was an error submitting your review. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Review';
        }
    });

    // Set up periodic refresh
    setInterval(fetchReviews, REFRESH_INTERVAL);

    // Initial fetch of reviews
    fetchReviews();

    // Refresh when page becomes visible again
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('Page became visible, refreshing reviews');
            fetchReviews();
        }
    });
});
