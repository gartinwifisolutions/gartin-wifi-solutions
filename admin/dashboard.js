document.addEventListener('DOMContentLoaded', () => {
    const consultationList = document.getElementById('consultationList');
    const noConsultations = document.getElementById('noConsultations');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    let consultations = [];

    // Fetch consultations from the server
    async function fetchConsultations() {
        try {
            const response = await fetch('/admin/consultations');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/admin/login.html';
                    return;
                }
                throw new Error('Failed to fetch consultations');
            }
            consultations = await response.json();
            displayConsultations(consultations);
        } catch (error) {
            console.error('Error:', error);
            consultationList.innerHTML = '<p class="error-message">Failed to load consultations. Please try again.</p>';
        }
    }

    // Display consultations based on filter
    function displayConsultations(consultations) {
        const filteredConsultations = currentFilter === 'all' 
            ? consultations 
            : consultations.filter(c => c.status === currentFilter);

        consultationList.innerHTML = '';
        
        if (filteredConsultations.length === 0) {
            consultationList.style.display = 'none';
            noConsultations.style.display = 'block';
        } else {
            consultationList.style.display = 'grid';
            noConsultations.style.display = 'none';
            
            filteredConsultations.forEach(consultation => {
                const card = createConsultationCard(consultation);
                consultationList.appendChild(card);
            });
        }
    }

    // Create a consultation card
    function createConsultationCard(consultation) {
        const card = document.createElement('div');
        card.className = 'consultation-card';
        
        const formattedDate = new Date(consultation.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Format message with line breaks
        const formattedMessage = consultation.message ? consultation.message.replace(/\n/g, '<br>') : '';

        card.innerHTML = `
            <div class="consultation-header">
                <h3 class="client-name">${consultation.name}</h3>
                <span class="status-badge status-${consultation.status}">${consultation.status}</span>
            </div>
            <div class="client-details">
                <div class="detail-group">
                    <div class="detail-label">Contact Info</div>
                    <p class="detail-value">${consultation.phone}</p>
                    <p class="detail-value">${consultation.email}</p>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Location</div>
                    <p class="detail-value">${consultation.address}</p>
                    <p class="detail-value">${consultation.address2 ? consultation.address2 + '<br>' : ''}${consultation.city}, ${consultation.state} ${consultation.zip}</p>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Submitted</div>
                    <p class="detail-value">${formattedDate}</p>
                </div>
            </div>
            ${consultation.message ? `
                <div class="detail-group">
                    <div class="detail-label">Additional Details</div>
                    <p class="detail-value">${formattedMessage}</p>
                </div>
            ` : ''}
            <div class="action-buttons">
                ${getActionButtons(consultation.status)}
            </div>
        `;

        // Add event listeners to action buttons
        const actionButtons = card.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const newStatus = button.dataset.status;
                try {
                    const response = await fetch(`/admin/consultations/${consultation.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update status');
                    }

                    // Update local data and refresh display
                    consultation.status = newStatus;
                    const consultationIndex = consultations.findIndex(c => c.id === consultation.id);
                    if (consultationIndex !== -1) {
                        consultations[consultationIndex] = consultation;
                    }
                    displayConsultations(consultations);
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to update consultation status. Please try again.');
                }
            });
        });

        return card;
    }

    // Get appropriate action buttons based on status
    function getActionButtons(status) {
        switch (status) {
            case 'new':
                return `
                    <button class="action-btn" data-status="contacted">Mark as Contacted</button>
                    <button class="action-btn" data-status="scheduled">Schedule Consultation</button>
                `;
            case 'contacted':
                return `
                    <button class="action-btn" data-status="scheduled">Schedule Consultation</button>
                `;
            case 'scheduled':
                return `
                    <button class="action-btn" data-status="completed">Mark as Completed</button>
                `;
            case 'completed':
                return '';
            default:
                return '';
        }
    }

    // Handle filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.status;
            displayConsultations(consultations);
        });
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/admin/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            window.location.href = '/admin/login.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to logout. Please try again.');
        }
    });

    // Initial fetch
    fetchConsultations();

    // Refresh data every 30 seconds
    setInterval(fetchConsultations, 30000);
});
