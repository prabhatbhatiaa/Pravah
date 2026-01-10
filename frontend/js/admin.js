    // =====================
    // CONFIGURATION
    // =====================
    const API_BASE = "https://pravah-br0g.onrender.com/";
    const DELHI_BOUNDS = [[28.40, 76.80], [28.90, 77.35]];
    const DELHI_CENTER = [28.6139, 77.2090];

    // State Variables
    let wards = [];
    let selectedWard = null;
    let sortKey = 'riskScore';
    let sortOrder = 'desc';
    let isClean = false;
    let map = null;
    let markers = [];

    // =====================
    // INITIALIZATION
    // =====================
    document.addEventListener('DOMContentLoaded', () => {
      if(window.lucide) lucide.createIcons();
      initMap();
      loadDashboardData();
    });

    // =====================
    // DATA FETCHING
    // =====================
    async function loadDashboardData() {
        try {
            // 1. Fetch Risk Summary for KPI cards
            const summaryRes = await fetch(`${API_BASE}/api/risk-summary`);
            if(summaryRes.ok) {
                const summary = await summaryRes.json();
                updateKPIs(summary);
            }

            // 2. Fetch Admin Overview (Table & List Data)
            const adminRes = await fetch(`${API_BASE}/api/admin/overview`);
            if(adminRes.ok) {
                const adminData = await adminRes.json();
                wards = adminData.wards; 
                
                // Calculate Total Complaints NOW, after wards are loaded
                const totalComplaints = wards.reduce((acc, w) => acc + (w.activeComplaints || 0), 0);
                document.getElementById('kpi-total').textContent = totalComplaints;

                renderTable();
                renderPriorityList(adminData.priorityWards);
                populateWardSelect();
                
                // 3. Fetch Map Data (GeoJSON) - Only after getting table data
                fetch(`${API_BASE}/api/wards`)
                    .then(res => res.json())
                    .then(geoJson => addMapMarkers(geoJson))
                    .catch(e => console.error("Map data error:", e));
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            showToast('Connection Error', 'Failed to connect to backend server', 'error');
        }
    }

    // =====================
    // MAP LOGIC
    // =====================
    function initMap() {
      map = L.map('map', {
        center: DELHI_CENTER,
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: DELHI_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // Dark Theme Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      map.fitBounds(DELHI_BOUNDS);
    }

    function addMapMarkers(geoJson) {
      markers.forEach(m => m.remove());
      markers = [];

      // Iterate over GeoJSON features
      geoJson.features.forEach(feature => {
        const props = feature.properties;
        const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        
        const riskLevel = (props.riskLevel || 'Low').toLowerCase();
        const color = getRiskColor(riskLevel);
        const radius = riskLevel === "high" ? 14 : riskLevel === "medium" ? 12 : 10;

        const circleMarker = L.circleMarker(coords, {
          radius: radius,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.7,
          className: `ward-hotspot ward-hotspot-${riskLevel}`,
        }).addTo(map);

        if (riskLevel === "high") {
          const pulseMarker = L.circleMarker(coords, {
            radius: radius + 8,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 0.3,
            fillOpacity: 0.2,
            className: "ward-hotspot-pulse",
          }).addTo(map);
          markers.push(pulseMarker);
        }

        const popupContent = `
          <div style="padding: 12px; font-family: 'Inter', sans-serif; min-width: 180px; background: #1a1a2e; color: #fff; border-radius: 8px; margin: -14px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${props.name}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: ${getRiskGlow(riskLevel)};"></span>
              <span style="font-size: 12px; color: ${color}; font-weight: 500; text-transform: uppercase;">
                ${props.riskLevel} Risk
              </span>
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 8px;">
              Zone: ${props.zone}<br/>
              Risk Score: ${props.riskScore}%<br/>
              Drainage: ${props.drainageCapacity}%
            </div>
          </div>
        `;

        circleMarker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -5],
          className: "dark-popup",
        });

        circleMarker.on("mouseover", function() { this.setRadius(radius + 4); this.openPopup(); });
        circleMarker.on("mouseout", function() { this.setRadius(radius); this.closePopup(); });
        circleMarker.on("click", function() { 
            const fullWardData = wards.find(w => w.id === props.id);
            if(fullWardData) selectWard(fullWardData); 
        });

        markers.push(circleMarker);
      });
    }

    // =====================
    // UI UPDATES & HELPERS
    // =====================
    function updateKPIs(summary) {
        document.getElementById('kpi-high-risk').textContent = summary.highRiskCount || 0;
        document.getElementById('kpi-pending').textContent = summary.mediumRiskCount || 0; 
        
        if(wards.length > 0) {
            const totalComplaints = wards.reduce((acc, w) => acc + (w.activeComplaints || 0), 0);
            document.getElementById('kpi-total').textContent = totalComplaints;
        } else {
             document.getElementById('kpi-total').textContent = "--";
        }
    }

    function getRiskColor(level) {
      if(!level) return "#6b7280";
      switch (level.toLowerCase()) {
        case "high": return "#ef4444";
        case "medium": return "#eab308";
        case "low": return "#22c55e";
        default: return "#6b7280";
      }
    }

    function getRiskGlow(level) {
      if(!level) return "none";
      switch (level.toLowerCase()) {
        case "high": return "0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)";
        case "medium": return "0 0 15px rgba(234, 179, 8, 0.5), 0 0 30px rgba(234, 179, 8, 0.2)";
        case "low": return "0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)";
        default: return "none";
      }
    }

    // =====================
    // TABLE RENDERER
    // =====================
    function renderTable() {
      const tbody = document.getElementById('ward-table-body');
      
      const sortedWards = [...wards].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });

      tbody.innerHTML = sortedWards.map((ward, index) => {
        const scoreClass = ward.riskScore >= 70 ? 'high' : ward.riskScore >= 40 ? 'medium' : 'low';
        const drainageClass = ward.drainageCapacity > 70 ? 'high' : ward.drainageCapacity > 40 ? 'medium' : 'low';
        const riskLevelLower = ward.riskLevel.toLowerCase();

        return `
          <tr onclick="selectWardById('${ward.id}')">
            <td class="cell-mono">${index + 1}</td>
            <td class="cell-name">${ward.name}</td>
            <td class="cell-zone">${ward.zone}</td>
            <td>
              <span class="mono" style="font-weight: 600; color: var(--risk-${scoreClass});">
                ${ward.riskScore}%
              </span>
            </td>
            <td>
              <span class="risk-badge ${riskLevelLower}">
                ${riskLevelLower === 'high' ? '<i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i>' : ''}
                ${ward.riskLevel.toUpperCase()}
              </span>
            </td>
            <td>
              <div class="progress-cell">
                <div class="progress-bar">
                  <div class="progress-fill ${drainageClass}" style="width: ${ward.drainageCapacity}%;"></div>
                </div>
                <span class="progress-value mono">${ward.drainageCapacity}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      lucide.createIcons();
    }

    function sortTable(key) {
      if (sortKey === key) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortOrder = 'desc';
      }
      renderTable();
    }

    // =====================
    // PRIORITY LIST
    // =====================
    function renderPriorityList(priorityWards) {
      const container = document.getElementById('priority-list');
      const listData = priorityWards || [...wards].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

      container.innerHTML = listData.map((ward, index) => {
        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : 'default';
        const scoreClass = ward.riskScore >= 70 ? 'high' : ward.riskScore >= 40 ? 'medium' : 'low';

        return `
          <button class="priority-item" onclick="selectWardById('${ward.id}')">
            <div class="priority-number ${rankClass}">${index + 1}</div>
            <div class="priority-info">
              <div class="priority-name">
                <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                <span>${ward.name}</span>
              </div>
              <p class="priority-zone">${ward.zone} Zone</p>
            </div>
            <div class="priority-score">
              <div class="priority-score-row">
                <i data-lucide="trending-up" style="width: 14px; height: 14px; color: var(--risk-high);"></i>
                <span class="priority-score-value ${scoreClass}">${ward.riskScore}%</span>
              </div>
              <p class="priority-score-label">Risk</p>
            </div>
          </button>
        `;
      }).join('');

      lucide.createIcons();
    }

    // =====================
    // INTERACTIONS
    // =====================
    function selectWardById(id) {
        const ward = wards.find(w => w.id === id);
        if(ward) selectWard(ward);
    }

    function selectWard(ward) {
      selectedWard = ward;
      const panel = document.getElementById('ward-details');
      panel.classList.remove('hidden');

      document.getElementById('ward-name').textContent = ward.name;
      document.getElementById('ward-zone').textContent = ward.zone + ' Zone';

      const riskLower = ward.riskLevel.toLowerCase();
      const icon = document.getElementById('ward-icon');
      const badge = document.getElementById('ward-risk-badge');
      const riskScore = document.getElementById('ward-risk-score');

      icon.className = `ward-details-icon ${riskLower}`;
      badge.className = `ward-risk-badge ${riskLower}`;
      document.getElementById('ward-risk-label').textContent = ward.riskLevel.toUpperCase() + ' RISK';

      riskScore.textContent = ward.riskScore + '%';
      riskScore.className = `stat-value ${riskLower}`;

      document.getElementById('ward-drainage').textContent = ward.drainageCapacity + '%';
      document.getElementById('ward-drainage-label').textContent = ward.drainageCapacity + '%';

      const progressFill = document.getElementById('ward-progress-fill');
      progressFill.style.width = ward.drainageCapacity + '%';
      progressFill.className = 'ward-progress-fill';
      
      if (ward.drainageCapacity > 70) {
        progressFill.style.background = 'var(--risk-low)';
      } else if (ward.drainageCapacity > 40) {
        progressFill.style.background = 'var(--risk-medium)';
      } else {
        progressFill.style.background = 'var(--risk-high)';
      }

      document.getElementById('ward-updated').textContent = 'Live Data Source';

      // Pre-select in form
      document.getElementById('ward-select').value = ward.id;
      document.getElementById('drainage-slider').value = ward.drainageCapacity;
      updateSliderValue(ward.drainageCapacity);

      lucide.createIcons();
    }

    function closeWardDetails() {
      selectedWard = null;
      document.getElementById('ward-details').classList.add('hidden');
    }

    function populateWardSelect() {
      const select = document.getElementById('ward-select');
      select.innerHTML = '<option value="">Choose a ward</option>' + 
        wards.map(ward => 
          `<option value="${ward.id}">${ward.name} (Current: ${ward.drainageCapacity}%)</option>`
        ).join('');
    }

    function updateSliderValue(value) {
      document.getElementById('drainage-value').textContent = value + '%';
    }

    function toggleSwitch() {
      isClean = !isClean;
      const switchEl = document.getElementById('clean-switch');
      if (isClean) {
        switchEl.classList.add('active');
        document.getElementById('drainage-slider').value = 100;
        updateSliderValue(100);
      } else {
        switchEl.classList.remove('active');
      }
    }

    // =====================
    // FORM SUBMISSION (REAL API)
    // =====================
    async function handleDrainageSubmit(e) {
      e.preventDefault();
      
      const wardId = document.getElementById('ward-select').value;
      const drainageCapacity = parseInt(document.getElementById('drainage-slider').value);
      
      if (!wardId) {
        showToast('Error', 'Please select a ward', 'error');
        return;
      }

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div> Updating...';

      try {
          const response = await fetch(`${API_BASE}/api/admin/update-drainage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ward_id: wardId,
                  drainage_capacity: drainageCapacity,
                  is_cleaned: isClean
              })
          });

          if(response.ok) {
              const ward = wards.find(w => w.id === wardId);
              showToast('Update Successful', `Drainage status updated for ${ward ? ward.name : wardId}`, 'success');
              
              // Refresh Dashboard Data
              loadDashboardData();
              
              // Reset UI
              document.getElementById('drainage-form').reset();
              document.getElementById('drainage-value').textContent = '50%';
              isClean = false;
              document.getElementById('clean-switch').classList.remove('active');
          } else {
              throw new Error("Server rejected update");
          }

      } catch (error) {
          console.error(error);
          showToast('Update Failed', 'Could not update drainage status', 'error');
      } finally {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="wrench" style="width: 16px; height: 16px;"></i> Update Drainage Status';
          lucide.createIcons();
      }
    }

    // =====================
    // TOAST & LOGOUT
    // =====================
    function showToast(title, message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle-2' : 'alert-circle'}" class="toast-icon ${type}" style="width: 20px; height: 20px;"></i>
        <div class="toast-content">
          <h4>${title}</h4>
          <p>${message}</p>
        </div>
      `;
      container.appendChild(toast);
      lucide.createIcons();

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function logout() {
      sessionStorage.removeItem('isLoggedIn');
      showToast('Logged Out', 'You have been logged out successfully', 'success');
      setTimeout(() => window.location.href = 'login.html', 1000);
    }
