document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complaintForm');

    // Populate dropdown logic
    window.populateFormDropdown = function(wardsData) {
        const select = document.getElementById('wardSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Select your ward</option>';
        
        // Sort alphabetical
        const features = wardsData.features.sort((a,b) => a.properties.name.localeCompare(b.properties.name));
        
        features.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.properties.id;
            opt.innerText = w.properties.name;
            select.appendChild(opt);
        });
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const wardSelect = document.getElementById('wardSelect');
            const description = document.getElementById('description');
            const severityInput = document.querySelector('input[name="severity"]:checked');

            if (!wardSelect.value || !severityInput) {
                Utils.showToast('Validation Error', 'Please select a ward and severity.', 'error');
                return;
            }

            const btn = form.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            const payload = {
                ward_id: wardSelect.value,
                severity: severityInput.value,
                description: description ? description.value : "",
                timestamp: new Date().toISOString()
            };

            try {
                const res = await fetch(`${API_BASE}/api/complaint`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    Utils.showToast('Submitted', 'Complaint registered successfully', 'success');
                    form.reset();
                    // Refresh dashboard data
                    if(typeof fetchDashboardData === 'function') fetchDashboardData();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                Utils.showToast('Error', 'Failed to connect to server', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});