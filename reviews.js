document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    const API_URL = 'https://gartin-wifi-api.onrender.com/api';
    const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

    // Fetch and display reviews
    async function fetchReviews() {
        try {
            console.log('Fetching reviews from:', `${API_URL}/reviews`);
            const response = await fetch(`${API_URL}/reviews`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
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
        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    Be the first to leave a review!
                </div>
            `;
            return;
        }

        // Sort reviews by date (newest first)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Displaying reviews in order:', reviews.map(r => r.name));

        const reviewsHtml = reviews.map(review => {
            const date = new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="review-card">
                    <div class="review-header">
                        <h3>${review.name}</h3>
                        <div class="stars">${'★'.repeat(review.rating)}</div>
                        <span class="review-date">${date}</span>
                    </div>
                    <p>${review.review}</p>
                </div>
            `;
        }).join('');

        reviewsList.innerHTML = reviewsHtml;
    }

    // Show error message
    function showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        reviewForm.insertAdjacentElement('beforebegin', errorDiv);
        setTimeout(() => errorDiv.remove(), duration);
    }

    // Show success message
    function showSuccess(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        reviewForm.insertAdjacentElement('beforebegin', successDiv);
        setTimeout(() => successDiv.remove(), duration);
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
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify(newReview)
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            // Reset form
            reviewForm.reset();
            showSuccess('Thank you for your review! It will appear on the page shortly.');
            
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
