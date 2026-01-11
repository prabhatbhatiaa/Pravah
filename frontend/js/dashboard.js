document.addEventListener('DOMContentLoaded', async () => {
    initMap();
    fetchDashboardData();
});

let map;
let markersLayer; // We use a LayerGroup for markers

// 1. Initialize Map
function initMap() {
    const delhiBounds = [
        [28.4045, 76.8425], 
        [28.8837, 77.3476]
    ];

    map = L.map('map', {
        center: [28.6139, 77.2090], 
        zoom: 11,
        minZoom: 11,
        maxZoom: 16,
        maxBounds: delhiBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
}

// 2. Fetch Data
async function fetchDashboardData() {
    const loader = document.getElementById('mapLoader');
    
    try {
        const [wardsRes, summaryRes, predictionRes] = await Promise.all([
            fetch(`${API_BASE}/api/wards`),
            fetch(`${API_BASE}/api/risk-summary`),
            fetch(`${API_BASE}/api/prediction?hours=24`)
        ]);

        if (!wardsRes.ok) throw new Error("Failed to load map data");

        const wardsData = await wardsRes.json();
        const summaryData = await summaryRes.json();
        const predictionData = await predictionRes.json();

        // Render everything
        renderMapMarkers(wardsData);
        updateKPIs(summaryData, predictionData);
        populateWardList(wardsData);
        populateFormDropdown(wardsData);

        if (loader) loader.style.display = 'none';

    } catch (error) {
        console.error("Dashboard Error:", error);
        if(loader) loader.innerHTML = `<span style="color:#ef4444">Connection Failed</span>`;
    }
}

// 3. Render Markers
function renderMapMarkers(geoJsonData) {
    markersLayer.clearLayers();

    geoJsonData.features.forEach(feature => {
        const props = feature.properties;
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        
        const riskLevel = (props.riskLevel || 'Low').toLowerCase();
        const color = Utils.getRiskColor(props.riskLevel); 
        
        // Determine size based on risk
        const radius = riskLevel === "high" ? 14 : riskLevel === "medium" ? 12 : 10;

        // 1. The Main Dot
        const marker = L.circleMarker([lat, lng], {
            radius: radius,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7,
            className: `ward-hotspot ward-hotspot-${riskLevel}` 
        });

        // 2. The Pulse Effect (Only for High Risk)
        if (riskLevel === "high") {
            const pulse = L.circleMarker([lat, lng], {
                radius: radius + 8,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.2,
                className: "ward-hotspot-pulse" // Applies CSS animation
            });
            markersLayer.addLayer(pulse);
        }

        // 3. Popup Content
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                    ${props.name}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
                    <span style="font-size: 12px; color: ${color}; font-weight: 600; text-transform: uppercase;">
                        ${props.riskLevel} Risk
                    </span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <span>Drainage:</span> <strong>${props.drainageCapacity}%</strong>
                    <span>Rainfall:</span> <strong>${props.rainfall}mm</strong>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, { className: 'dark-popup' });

        // Interactive Hover
        marker.on('mouseover', function() { this.openPopup(); this.setRadius(radius + 2); });
        marker.on('mouseout', function() { this.closePopup(); this.setRadius(radius); });
        marker.on('click', () => {
            map.flyTo([lat, lng], 14, { duration: 1.5 });
        });

        markersLayer.addLayer(marker);
    });
}

// 4. Update KPI Cards
function updateKPIs(summary, prediction) {
    document.getElementById('highRiskCount').innerText = summary.highRiskCount || 0;
    document.getElementById('medRiskCount').innerText = summary.mediumRiskCount || 0;
    document.getElementById('predictedCount').innerText = prediction.predictedFloods || 0;
    document.getElementById('lastUpdated').innerText = new Date().toLocaleTimeString();
}

// 5. Populate Sidebar List
function populateWardList(geoJsonData) {
    const listContainer = document.getElementById('wardList');
    listContainer.innerHTML = '';

    const sortedWards = geoJsonData.features.sort((a, b) => {
        const riskScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return riskScore[b.properties.riskLevel || 'Low'] - riskScore[a.properties.riskLevel || 'Low'];
    });

    sortedWards.forEach(ward => {
        const props = ward.properties;
        const color = Utils.getRiskColor(props.riskLevel);
        
        const item = document.createElement('div');
        item.className = 'quick-stat-row';
        item.style.cursor = 'pointer';
        item.style.borderLeft = `3px solid ${color}`;
        item.style.paddingLeft = '8px';
        
        item.innerHTML = `
            <span style="font-weight:500; color: #e2e8f0;">${props.name}</span>
            <span style="color:${color}; font-weight:600; font-size: 0.85rem;">${props.riskLevel}</span>
        `;

        item.addEventListener('click', () => {
            const lat = ward.geometry.coordinates[1];
            const lng = ward.geometry.coordinates[0];
            map.flyTo([lat, lng], 14);
        });

        listContainer.appendChild(item);
    });
}

// 6. Populate Form Dropdown
function populateFormDropdown(geoJsonData) {
    const select = document.getElementById('wardSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select your ward</option>';
    
    // Alphabetical Sort
    const sorted = geoJsonData.features.sort((a,b) => a.properties.name.localeCompare(b.properties.name));

    sorted.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.properties.id;
        option.textContent = ward.properties.name;
        select.appendChild(option);
    });
}