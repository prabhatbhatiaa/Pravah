// 1. Auth Check
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// Global state for sorting
let currentWards = [];
let sortDirection = 'desc';

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    
    initAdminMap();
    fetchAdminData();
});

let map;

// 2. Map Logic (Admin)
function initAdminMap() {
    map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19
    }).addTo(map);
}

// 3. Fetch Data
async function fetchAdminData() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/overview`);
        if (!response.ok) throw new Error("API Error");
        
        const data = await response.json();
        currentWards = data.wards; // Store for sorting

        renderStats(currentWards);
        renderTable(currentWards);
        renderPriorityList(data.priorityWards);
        populateDropdown(currentWards);
        
        // Render Map Markers (fetch geojson separately to get coordinates)
        fetch(`${API_BASE}/api/wards`)
            .then(r => r.json())
            .then(geo => renderMapMarkers(geo));

    } catch (error) {
        console.error(error);
        Utils.showToast('System Error', 'Failed to load admin data', 'error');
    }
}

// 4. Render Table (Using your HTML IDs)
function renderTable(wards) {
    const tbody = document.getElementById('ward-table-body');
    tbody.innerHTML = '';

    wards.forEach((w, idx) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openWardDetails(w); // Hook up the slide panel
        
        const color = Utils.getRiskColor(w.riskLevel);
        const drainageClass = w.drainageCapacity > 70 ? 'low' : w.drainageCapacity > 40 ? 'medium' : 'high'; // Inverted logic for bar color class

        tr.innerHTML = `
            <td class="cell-mono">${String(idx + 1).padStart(2, '0')}</td>
            <td class="cell-name">${w.name}</td>
            <td class="cell-zone">${w.zone}</td>
            <td><span class="mono" style="font-weight:600; color:${color}">${w.riskScore}%</span></td>
            <td><span class="risk-badge ${w.riskLevel.toLowerCase()}">${w.riskLevel}</span></td>
            <td>
                <div class="progress-cell">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${w.drainageCapacity}%; background:${w.drainageCapacity < 40 ? '#ef4444' : '#10b981'}"></div>
                    </div>
                    <span class="progress-value mono">${w.drainageCapacity}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    if (window.lucide) lucide.createIcons();
}

// 5. Render Priority List
function renderPriorityList(wards) {
    const list = document.getElementById('priority-list');
    list.innerHTML = '';

    wards.forEach((w, i) => {
        const color = Utils.getRiskColor(w.riskLevel);
        const div = document.createElement('button');
        div.className = 'priority-item';
        div.onclick = () => openWardDetails(w);

        div.innerHTML = `
            <div class="priority-number ${i === 0 ? 'rank-1' : 'rank-2'}">${i+1}</div>
            <div class="priority-info">
                <div class="priority-name"><span>${w.name}</span></div>
                <p class="priority-zone">${w.zone}</p>
            </div>
            <div class="priority-score">
                 <span class="priority-score-value" style="color:${color}">${w.riskScore}%</span>
            </div>
        `;
        list.appendChild(div);
    });
}

// 6. Form & Slider Logic
function populateDropdown(wards) {
    const select = document.getElementById('ward-select'); // ID from your admin.html
    select.innerHTML = '<option value="">Choose a ward...</option>';
    wards.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.text = w.name;
        select.appendChild(opt);
    });
}

// Hook up the slider to update the text value
const slider = document.getElementById('drainage-slider');
if(slider) {
    slider.addEventListener('input', (e) => {
        document.getElementById('drainage-value').innerText = e.target.value + '%';
    });
}

// Handle Form Submit
window.handleDrainageSubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerHTML;
    
    const wardId = document.getElementById('ward-select').value;
    const capacity = document.getElementById('drainage-slider').value;
    const isClean = document.getElementById('clean-switch').classList.contains('active');

    if (!wardId) return Utils.showToast('Error', 'Select a ward first', 'error');

    btn.innerHTML = 'Updating...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/api/admin/update-drainage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ward_id: wardId,
                drainage_capacity: parseInt(capacity),
                is_cleaned: isClean
            })
        });

        if (res.ok) {
            Utils.showToast('Success', 'Drainage Updated');
            fetchAdminData(); // Refresh UI
            document.getElementById('drainage-form').reset();
        } else {
            throw new Error();
        }
    } catch (err) {
        Utils.showToast('Error', 'Update failed', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// 7. Toggle Switch Helper
window.toggleSwitch = function() {
    document.getElementById('clean-switch').classList.toggle('active');
}

// 8. Slide Up Panel Logic
window.openWardDetails = function(w) {
    const panel = document.getElementById('ward-details');
    panel.classList.remove('hidden');
    
    document.getElementById('ward-name').innerText = w.name;
    document.getElementById('ward-zone').innerText = w.zone + ' Zone';
    document.getElementById('ward-risk-score').innerText = w.riskScore + '%';
    document.getElementById('ward-drainage').innerText = w.drainageCapacity + '%';
    
    // Update colors
    const color = Utils.getRiskColor(w.riskLevel);
    document.getElementById('ward-risk-score').style.color = color;
    document.getElementById('ward-risk-label').innerText = w.riskLevel + ' RISK';
    
    // Prefill the form when opening details
    document.getElementById('ward-select').value = w.id;
    document.getElementById('drainage-slider').value = w.drainageCapacity;
    document.getElementById('drainage-value').innerText = w.drainageCapacity + '%';
}

window.closeWardDetails = function() {
    document.getElementById('ward-details').classList.add('hidden');
}

// 9. Stats Header
function renderStats(wards) {
    const high = wards.filter(w => w.riskLevel === 'High').length;
    document.getElementById('kpi-high-risk').innerText = high;
    // Calculate total complaints from array
    const total = wards.reduce((sum, w) => sum + (w.activeComplaints || 0), 0);
    document.getElementById('kpi-total').innerText = total;
}

// 10. Map Markers
function renderMapMarkers(geoJson) {
    if (!map) return;
    L.geoJSON(geoJson, {
        pointToLayer: (feature, latlng) => {
            const color = Utils.getRiskColor(feature.properties.riskLevel);
            return L.circleMarker(latlng, {
                radius: 8, fillColor: color, color: '#fff', weight:1, fillOpacity: 0.8
            });
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => openWardDetails(feature.properties));
        }
    }).addTo(map);
}

// 11. Sorting
window.sortTable = function(key) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    currentWards.sort((a, b) => {
        if (sortDirection === 'asc') return a[key] > b[key] ? 1 : -1;
        return a[key] < b[key] ? 1 : -1;
    });
    renderTable(currentWards);
}

// Logout
window.logout = function() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}