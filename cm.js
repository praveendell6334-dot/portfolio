document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Skills Balance Doughnut Chart ---
    const ctxSkills = document.getElementById('skillsChart').getContext('2d');
    new Chart(ctxSkills, {
        type: 'doughnut',
        data: {
            labels: ['Python', 'SQL', 'Tableau'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#a16eff', '#4d9eff', '#ffce54'],
                borderColor: '#1A1D2D',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });

    // --- 2. Project Impact Over Time Line Chart ---
    const ctxImpact = document.getElementById('impactChart').getContext('2d');
    new Chart(ctxImpact, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Project Revenue Impact',
                data: [1200, 1900, 1500, 2800, 2200, 3400],
                borderColor: '#4d9eff',
                backgroundColor: 'rgba(77, 158, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#1A1D2D',
                pointBorderColor: '#4d9eff',
                pointRadius: 5,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#b0b3c7' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#b0b3c7' }
                }
            }
        }
    });

});