document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    const API_URL = 'https://gartin-wifi-api.onrender.com/api';

    // Fetch and display reviews
    async function fetchReviews() {
        try {
            const response = await fetch(`${API_URL}/reviews`);
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            const reviews = await response.json();
            displayReviews(reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showError('Unable to load reviews. Please try again later.');
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
        setTimeout(() => successDiv.remove(), 5000);
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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReview)
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            // Reset form
            reviewForm.reset();
            showSuccess('Thank you for your review! It will be visible after approval.');
            
            // Refresh reviews
            fetchReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            showError('Sorry, there was an error submitting your review. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Review';
        }
    });

    // Initial fetch of reviews
    fetchReviews();
});
